import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import Fastify from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { z } from 'zod';

import { env } from './config/env.js';
import { authPlugin } from './plugins/auth.js';

import { authRoutes } from './routes/auth.routes.js';
import { articleRoutes } from './routes/articles.routes.js';
import { uploadRoutes } from './routes/upload.routes.js';
import { pingRoutes } from './routes/ping.routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  // Faz o Fastify entender schemas Zod para validar body/params/query
  // e serializar as respostas
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cors, {
    origin: (origin, cb) => {
      // Permite requisições sem origin (ex: mobile, curl, Postman)
      if (!origin || env.FRONTEND_URL === '*' || origin === env.FRONTEND_URL) {
        cb(null, true);
        return;
      }

      // Permite múltiplos domínios caso FRONTEND_URL tenha vírgulas
      const allowed = env.FRONTEND_URL.split(',').map((item) => item.trim());
      if (allowed.includes(origin) || env.NODE_ENV === 'development') {
        cb(null, true);
        return;
      }

      // Não lança erro para evitar status 500 no preflight (OPTIONS)
      cb(null, false);
    },
    credentials: true,
  });

  await app.register(multipart);

  await app.register(authPlugin);

  // Rota raiz para conferir se a API está online pelo navegador
  app.get('/', async () => ({
    nome: 'Paróquia Notícias API',
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // Rota de verificação de saúde da API
  app.get(
    '/api/saude',
    {
      schema: {
        response: {
          200: z.object({ status: z.literal('ok') }),
        },
      },
    },
    async () => ({ status: 'ok' as const })
  );

  // Rota /api para facilidade de teste
  app.get('/api', async () => ({
    nome: 'Paróquia Notícias API',
    status: 'ok',
    saude: '/api/saude',
  }));

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(articleRoutes, { prefix: '/api/artigos' });
  await app.register(uploadRoutes, { prefix: '/api/upload' });
  await app.register(pingRoutes, { prefix: '/api/ping' });

  return app;
}

export { jsonSchemaTransform };
