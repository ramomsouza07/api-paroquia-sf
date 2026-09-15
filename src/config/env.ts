import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida de conexão PostgreSQL'),
  DIRECT_URL: z.string().url('DIRECT_URL deve ser uma URL válida de conexão PostgreSQL direta'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET precisa ter pelo menos 16 caracteres'),
  PORT: z.coerce.number().default(3333),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Supabase Storage (upload de imagens)
  SUPABASE_URL: z.string().url('SUPABASE_URL deve ser uma URL válida do Supabase'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY é obrigatória'),
  SUPABASE_STORAGE_BUCKET: z.string().default('artigos-imagens'),
});

const resultado = envSchema.safeParse(process.env);

if (!resultado.success) {
  const formatado = Object.entries(resultado.error.flatten().fieldErrors)
    .map(([campo, erros]) => `• ${campo}: ${erros?.join(', ')}`)
    .join('\n');

  console.error('❌ Variáveis de ambiente inválidas ou ausentes na Vercel:\n' + formatado);
  throw new Error(`Configuração de ambiente incompleta na Vercel:\n${formatado}`);
}

export const env = resultado.data;