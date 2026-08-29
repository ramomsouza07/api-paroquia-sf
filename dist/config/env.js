import 'dotenv/config';
import { z } from 'zod';
const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url(),
    JWT_SECRET: z.string().min(16, 'JWT_SECRET precisa ter pelo menos 16 caracteres'),
    PORT: z.coerce.number().default(3333),
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    // Supabase Storage (upload de imagens)
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_STORAGE_BUCKET: z.string().default('artigos-imagens'),
});
const resultado = envSchema.safeParse(process.env);
if (!resultado.success) {
    console.error('❌ Variáveis de ambiente inválidas:');
    console.error(resultado.error.format());
    process.exit(1);
}
export const env = resultado.data;
//# sourceMappingURL=env.js.map