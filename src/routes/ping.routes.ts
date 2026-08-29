import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { prisma } from '../lib/prisma.js';
import { erroResponseSchema } from '../schemas/common.schema.js';

const pingResponseSchema = z.object({
  status: z.literal('ok'),
  banco: z.literal('conectado'),
  timestamp: z.string(),
});

export async function pingRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Rota chamada por um serviço externo (ex: cron-job.org) de tempos em
  // tempos, só pra manter a API (Render) e o banco (Supabase) ativos:
  // - evita o Render "dormir" por inatividade (plano free)
  // - faz uma query de verdade no Postgres, evitando que o Supabase
  //   pause o projeto por 7 dias sem atividade no banco (plano free)
  server.get(
    '/',
    {
      schema: {
        response: {
          200: pingResponseSchema,
          500: erroResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        // Query mínima, só pra "tocar" no banco — não depende de
        // nenhuma tabela específica existir.
        await prisma.$queryRaw`SELECT 1`;

        return {
          status: 'ok' as const,
          banco: 'conectado' as const,
          timestamp: new Date().toISOString(),
        };
      } catch (err) {
        request.log.error(err);
        return reply.code(500).send({ erro: 'Falha ao conectar no banco de dados' });
      }
    }
  );
}