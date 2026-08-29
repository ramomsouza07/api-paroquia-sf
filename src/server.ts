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

const app = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

// Faz o Fastify entender schemas Zod para validar body/params/query
// e serializar as respostas
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

async function bootstrap() {
  await app.register(cors, {
    origin: env.FRONTEND_URL,
  });

  await app.register(multipart);

  await app.register(authPlugin);

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

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(articleRoutes, { prefix: '/api/artigos' });
  await app.register(uploadRoutes, { prefix: '/api/upload' });
  await app.register(pingRoutes, { prefix: '/api/ping' });

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();

// Exportado para uso em testes futuros, se quiser usar app.inject()
export { app };

// jsonSchemaTransform fica disponível aqui caso você adicione
// @fastify/swagger depois, para gerar documentação a partir dos schemas Zod
export { jsonSchemaTransform };