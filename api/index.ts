import type { IncomingMessage, ServerResponse } from 'node:http';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';

let appPromise: Promise<FastifyInstance> | null = null;

async function getApp(): Promise<FastifyInstance> {
  if (!appPromise) {
    appPromise = (async () => {
      const app = await buildApp();
      await app.ready();
      return app;
    })().catch((err) => {
      appPromise = null;
      throw err;
    });
  }
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await getApp();

    // Na Vercel, caso ocorra rewrite para /api,
    // os cabeçalhos x-matched-path ou x-forwarded-uri contêm o caminho original da requisição.
    if (req.url && (req.url === '/api' || req.url.startsWith('/api?'))) {
      const originalPath = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'];
      if (typeof originalPath === 'string' && originalPath.length > 0) {
        req.url = originalPath;
      }
    }

    app.server.emit('request', req, res);
  } catch (err) {
    console.error('❌ Erro na execução da função serverless na Vercel:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        erro: 'Erro interno na inicialização da API na Vercel',
        mensagem: err instanceof Error ? err.message : 'Erro desconhecido',
        stack: err instanceof Error ? err.stack : undefined,
      })
    );
  }
}
