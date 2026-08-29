import bcrypt from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

import { prisma } from '../lib/prisma.js';
import { erroResponseSchema } from '../schemas/common.schema.js';
import { loginBodySchema, loginResponseSchema } from '../schemas/auth.schema.js';

export async function authRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.post(
    '/login',
    {
      schema: {
        body: loginBodySchema,
        response: {
          200: loginResponseSchema,
          401: erroResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, senha } = request.body;

      const admin = await prisma.admin.findUnique({ where: { email } });

      if (!admin || !(await bcrypt.compare(senha, admin.senhaHash))) {
        return reply.code(401).send({ erro: 'Email ou senha inválidos' });
      }

      const token = app.jwt.sign(
        { id: admin.id, nome: admin.nome, email: admin.email },
        { expiresIn: '8h' }
      );

      return {
        token,
        admin: { id: admin.id, nome: admin.nome, email: admin.email },
      };
    }
  );
}
