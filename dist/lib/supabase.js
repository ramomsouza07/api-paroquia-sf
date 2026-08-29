import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
// Client com a service_role key: só pode ser usado aqui no backend,
// nunca no frontend. Ele ignora as políticas de RLS do bucket — quem
// controla quem pode subir imagem é a própria API (rota protegida
// por JWT em upload.routes.ts), não o Supabase.
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        persistSession: false,
    },
});
//# sourceMappingURL=supabase.js.map