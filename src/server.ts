import { buildApp, jsonSchemaTransform } from './app.js';
import { env } from './config/env.js';

async function bootstrap() {
  try {
    const app = await buildApp();
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`🚀 Servidor rodando na porta ${env.PORT}`);
  } catch (err) {
    console.error('❌ Erro ao inicializar o servidor:', err);
    process.exit(1);
  }
}

bootstrap();

export { buildApp, jsonSchemaTransform };