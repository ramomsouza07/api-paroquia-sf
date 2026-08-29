import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import { env } from '../config/env.js';
async function authPluginImpl(app) {
    await app.register(fastifyJwt, {
        secret: env.JWT_SECRET,
    });
    // Uso: fastify.get('/rota', { onRequest: [app.authenticate] }, handler)
    app.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch {
            reply.code(401).send({ erro: 'Não autorizado' });
        }
    });
}
// fp() remove o encapsulamento do plugin: sem isso, o decorator
// "authenticate" e o registro do @fastify/jwt ficariam presos só
// dentro deste plugin e não seriam enxergados pelas rotas registradas
// depois dele (articleRoutes, etc), causando
// "onRequest hook should be a function, instead got [object Undefined]".
export const authPlugin = fp(authPluginImpl, {
    name: 'auth-plugin',
});
//# sourceMappingURL=auth.js.map