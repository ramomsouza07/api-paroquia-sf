import 'fastify';
import '@fastify/jwt';

// Payload que colocamos dentro do token JWT (ver plugins/auth.ts)
export interface JwtPayload {
  id: string;
  nome: string;
  email: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
