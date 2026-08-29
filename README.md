# API — Notícias da Paróquia (TypeScript)

Stack: Fastify + TypeScript + Prisma + Supabase (Postgres) + Zod + JWT.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Preencha o `.env` com as credenciais do seu projeto Supabase:
- `DATABASE_URL` → Project Settings > Database > Connection pooling (porta 6543)
- `DIRECT_URL` → Project Settings > Database > Connection string direta (porta 5432)
- `JWT_SECRET` → qualquer string longa e aleatória

Rode a primeira migration (cria as tabelas `admins` e `artigos` no Supabase):

```bash
npm run prisma:migrate
```

Suba a API em modo dev (recarrega sozinho a cada mudança):

```bash
npm run dev
```

Teste: `GET http://localhost:3333/api/saude` deve retornar `{ "status": "ok" }`.

## Estrutura atual

```
backend/
├── prisma/
│   └── schema.prisma       # models Admin e Artigo
├── src/
│   ├── config/env.ts       # variáveis de ambiente validadas com Zod
│   ├── lib/prisma.ts       # instância única do Prisma Client
│   ├── plugins/auth.ts     # registra @fastify/jwt + decorator "authenticate"
│   ├── schemas/            # schemas Zod (validação + tipos)
│   ├── types/fastify.d.ts  # tipagem do JWT payload e do decorator
│   └── server.ts           # bootstrap do Fastify
└── .env.example
```

## Próximos passos

1. Schemas Zod de `Artigo` (criar/editar/listar) em `src/schemas/artigo.schema.ts`.
2. `src/routes/auth.routes.ts` — login do admin, gera o JWT.
3. `src/routes/articles.routes.ts` — CRUD de artigos usando Prisma, registrado no `server.ts`.
4. `prisma/seed.ts` — cria o admin inicial (com `bcryptjs`).
