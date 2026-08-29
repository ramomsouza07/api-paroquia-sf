import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { erroResponseSchema } from '../schemas/common.schema.js';
import { artigoIdParamsSchema, artigoSchema, artigoSlugParamsSchema, atualizarArtigoBodySchema, criarArtigoBodySchema, listaArtigosResponseSchema, listarArtigosQuerySchema, } from '../schemas/artigo.schema.js';
import { gerarSlug } from '../utils/slugify.js';
// Campos retornados na listagem pública (evita mandar o "conteudo" inteiro)
const CAMPOS_LISTA = {
    id: true,
    titulo: true,
    slug: true,
    resumo: true,
    imagemCapa: true,
    categoria: true,
    dataPublicacao: true,
};
export async function articleRoutes(app) {
    const server = app.withTypeProvider();
    // ---------- Rotas públicas ----------
    // Lista de artigos publicados (paginada) — usado na aba de notícias
    server.get('/', {
        schema: {
            querystring: listarArtigosQuerySchema,
            response: { 200: listaArtigosResponseSchema },
        },
    }, async (request) => {
        const { pagina, porPagina } = request.query;
        const [artigos, total] = await Promise.all([
            prisma.artigo.findMany({
                where: { publicado: true },
                select: CAMPOS_LISTA,
                orderBy: { dataPublicacao: 'desc' },
                skip: (pagina - 1) * porPagina,
                take: porPagina,
            }),
            prisma.artigo.count({ where: { publicado: true } }),
        ]);
        return { artigos, total, pagina, porPagina };
    });
    // Artigo único por slug — usado na página do artigo
    server.get('/:slug', {
        schema: {
            params: artigoSlugParamsSchema,
            response: { 200: artigoSchema, 404: erroResponseSchema },
        },
    }, async (request, reply) => {
        const artigo = await prisma.artigo.findFirst({
            where: { slug: request.params.slug, publicado: true },
        });
        if (!artigo) {
            return reply.code(404).send({ erro: 'Artigo não encontrado' });
        }
        return artigo;
    });
    // ---------- Rotas protegidas (admin) ----------
    // Lista completa, incluindo rascunhos não publicados
    server.get('/admin/todos', {
        onRequest: [app.authenticate],
        schema: { response: { 200: z.array(artigoSchema) } },
    }, async () => {
        return prisma.artigo.findMany({ orderBy: { criadoEm: 'desc' } });
    });
    server.get('/admin/:id', {
        onRequest: [app.authenticate],
        schema: {
            params: artigoIdParamsSchema,
            response: { 200: artigoSchema, 404: erroResponseSchema },
        },
    }, async (request, reply) => {
        const artigo = await prisma.artigo.findUnique({ where: { id: request.params.id } });
        if (!artigo)
            return reply.code(404).send({ erro: 'Artigo não encontrado' });
        return artigo;
    });
    server.post('/', {
        onRequest: [app.authenticate],
        schema: {
            body: criarArtigoBodySchema,
            response: { 201: artigoSchema, 400: erroResponseSchema },
        },
    }, async (request, reply) => {
        const { titulo, resumo, conteudo, imagemCapa, categoria, publicado } = request.body;
        let slug = gerarSlug(titulo);
        const existente = await prisma.artigo.findUnique({ where: { slug } });
        if (existente)
            slug = `${slug}-${Date.now()}`;
        const artigo = await prisma.artigo.create({
            data: {
                titulo,
                slug,
                resumo,
                conteudo,
                imagemCapa,
                categoria,
                publicado,
                autorId: request.user.id,
                dataPublicacao: publicado ? new Date() : null,
            },
        });
        return reply.code(201).send(artigo);
    });
    server.put('/:id', {
        onRequest: [app.authenticate],
        schema: {
            params: artigoIdParamsSchema,
            body: atualizarArtigoBodySchema,
            response: { 200: artigoSchema, 404: erroResponseSchema },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const dados = request.body;
        const atual = await prisma.artigo.findUnique({ where: { id } });
        if (!atual)
            return reply.code(404).send({ erro: 'Artigo não encontrado' });
        // Define a data de publicação só na primeira vez que o artigo é publicado
        const vaiPublicarAgora = !atual.publicado && dados.publicado === true;
        const artigo = await prisma.artigo.update({
            where: { id },
            data: {
                ...dados,
                dataPublicacao: vaiPublicarAgora ? new Date() : undefined,
            },
        });
        return artigo;
    });
    server.delete('/:id', {
        onRequest: [app.authenticate],
        schema: {
            params: artigoIdParamsSchema,
            response: { 204: z.null() },
        },
    }, async (request, reply) => {
        await prisma.artigo.delete({ where: { id: request.params.id } });
        return reply.code(204).send(null);
    });
}
//# sourceMappingURL=articles.routes.js.map