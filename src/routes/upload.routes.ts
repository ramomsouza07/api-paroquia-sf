import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { env } from '../config/env.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { erroResponseSchema } from '../schemas/common.schema.js';

const TIPOS_PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const TAMANHO_MAXIMO_MB = 5;

const uploadResponseSchema = z.object({
  url: z.url(),
});

export async function uploadRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Recebe multipart/form-data com um campo de arquivo (qualquer nome,
  // ex: "file") e devolve a URL pública da imagem no Supabase Storage.
  server.post(
    '/imagem',
    {
      onRequest: [app.authenticate],
      schema: {
        response: {
          201: uploadResponseSchema,
          400: erroResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const arquivo = await request.file({
        limits: { fileSize: TAMANHO_MAXIMO_MB * 1024 * 1024 },
      });

      if (!arquivo) {
        return reply.code(400).send({ erro: 'Nenhum arquivo enviado' });
      }

      if (!TIPOS_PERMITIDOS.has(arquivo.mimetype)) {
        return reply
          .code(400)
          .send({ erro: 'Formato não suportado. Use JPG, PNG, WEBP ou GIF.' });
      }

      let buffer: Buffer;
      try {
        buffer = await arquivo.toBuffer();
      } catch {
        return reply
          .code(400)
          .send({ erro: `Arquivo muito grande (máximo ${TAMANHO_MAXIMO_MB}MB)` });
      }

      const extensao = arquivo.filename.split('.').pop() || 'jpg';
      const nomeArquivo = `${randomUUID()}.${extensao}`;

      const { error } = await supabaseAdmin.storage
        .from(env.SUPABASE_STORAGE_BUCKET)
        .upload(nomeArquivo, buffer, {
          contentType: arquivo.mimetype,
          upsert: false,
        });

      if (error) {
        request.log.error(error);
        return reply.code(400).send({ erro: 'Falha ao enviar imagem para o storage' });
      }

      const { data } = supabaseAdmin.storage
        .from(env.SUPABASE_STORAGE_BUCKET)
        .getPublicUrl(nomeArquivo);

      return reply.code(201).send({ url: data.publicUrl });
    }
  );
}