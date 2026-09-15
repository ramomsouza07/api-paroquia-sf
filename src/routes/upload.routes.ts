import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { env } from '../config/env.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { erroResponseSchema } from '../schemas/common.schema.js';

const TIPOS_PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// Aceita bem mais que o resultado final vai pesar, já que a imagem
// original (foto de celular sem tratamento, por exemplo) é comprimida
// aqui no servidor antes de subir pro Supabase.
const TAMANHO_MAXIMO_MB = 15;

// Nenhuma imagem de artigo precisa ser mais larga que isso — o container
// do conteúdo no site tem no máximo ~800px, então 1600px já cobre até
// telas retina (2x) com folga.
const LARGURA_MAXIMA_PX = 1600;
const QUALIDADE_WEBP = 80;

const uploadResponseSchema = z.object({
  url: z.url(),
});

export async function uploadRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Recebe multipart/form-data com um campo de arquivo (qualquer nome,
  // ex: "file"), comprime a imagem (redimensiona + converte pra WebP) e
  // devolve a URL pública já da versão otimizada no Supabase Storage.
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

      let bufferOriginal: Buffer;
      try {
        bufferOriginal = await arquivo.toBuffer();
      } catch {
        return reply
          .code(400)
          .send({ erro: `Arquivo muito grande (máximo ${TAMANHO_MAXIMO_MB}MB)` });
      }

      // GIF animado: não converte (o sharp/webp perderia a animação,
      // pegando só o primeiro frame). Sobe o GIF original mesmo.
      const ehGifAnimado = arquivo.mimetype === 'image/gif';

      let bufferFinal: Buffer;
      let contentType: string;
      let extensaoFinal: string;

      if (ehGifAnimado) {
        bufferFinal = bufferOriginal;
        contentType = 'image/gif';
        extensaoFinal = 'gif';
      } else {
        try {
          const { default: sharp } = await import('sharp');
          bufferFinal = await sharp(bufferOriginal)
            .resize({ width: LARGURA_MAXIMA_PX, withoutEnlargement: true })
            .webp({ quality: QUALIDADE_WEBP })
            .toBuffer();
        } catch (err) {
          request.log.error(err);
          return reply.code(400).send({ erro: 'Não foi possível processar essa imagem' });
        }
        contentType = 'image/webp';
        extensaoFinal = 'webp';
      }

      const nomeArquivo = `${randomUUID()}.${extensaoFinal}`;

      const { error } = await supabaseAdmin.storage
        .from(env.SUPABASE_STORAGE_BUCKET)
        .upload(nomeArquivo, bufferFinal, {
          contentType,
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