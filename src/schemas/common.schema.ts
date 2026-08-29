import { z } from 'zod';

// Formato padrão de erro retornado pela API
export const erroResponseSchema = z.object({
  erro: z.string(),
});

export type ErroResponse = z.infer<typeof erroResponseSchema>;
