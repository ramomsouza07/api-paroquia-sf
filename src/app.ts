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

  // Habilita CORS completo refletindo o Origin da requisição e aceitando credenciais e preflight
  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  });

  await app.register(multipart);

  await app.register(authPlugin);

  // Rota raiz para conferir se a API está online pelo navegador
  app.get('/', async () => ({
    nome: 'Paróquia Notícias API',
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // Rotas de verificação de saúde da API
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

  app.get('/saude', async () => ({ status: 'ok' as const }));

  // Rota /api para facilidade de teste
  app.get('/api', async () => ({
    nome: 'Paróquia Notícias API',
    status: 'ok',
    saude: '/api/saude',
  }));

  // Registra as rotas com prefixo /api (padrão)
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(articleRoutes, { prefix: '/api/artigos' });
  await app.register(uploadRoutes, { prefix: '/api/upload' });
  await app.register(pingRoutes, { prefix: '/api/ping' });

  // Também registra as rotas SEM prefixo /api para compatibilidade total
  // caso o frontend tenha configurado VITE_API_URL sem o "/api" no final
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(articleRoutes, { prefix: '/artigos' });
  await app.register(uploadRoutes, { prefix: '/upload' });
  await app.register(pingRoutes, { prefix: '/ping' });

  return app;
}

export { jsonSchemaTransform };
