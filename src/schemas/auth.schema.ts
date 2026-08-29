import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z.email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

export const loginResponseSchema = z.object({
  token: z.string(),
  admin: z.object({
    id: z.uuid(),
    nome: z.string(),
    email: z.email(),
  }),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
