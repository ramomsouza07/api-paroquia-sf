import { z } from 'zod';

// ---------- Schema base (o que um artigo tem) ----------

export const artigoSchema = z.object({
  id: z.uuid(),
  titulo: z.string(),
  slug: z.string(),
  resumo: z.string().nullable(),
  conteudo: z.string(),
  imagemCapa: z.string().nullable(),
  categoria: z.string(),
  publicado: z.boolean(),
  autorId: z.uuid().nullable(),
  dataPublicacao: z.coerce.date().nullable(),
  criadoEm: z.coerce.date(),
  atualizadoEm: z.coerce.date(),
});

// Versão resumida usada na listagem pública (sem o conteúdo inteiro)
export const artigoResumoSchema = artigoSchema.pick({
  id: true,
  titulo: true,
  slug: true,
  resumo: true,
  imagemCapa: true,
  categoria: true,
  dataPublicacao: true,
});

// ---------- Body de criação ----------

export const criarArtigoBodySchema = z.object({
  titulo: z.string().min(3, 'Título muito curto').max(250),
  resumo: z.string().max(500).optional(),
  conteudo: z.string().min(1, 'Conteúdo é obrigatório'),
  imagemCapa: z.url('URL da imagem inválida').optional(),
  categoria: z.string().max(100).default('Noticias'),
  publicado: z.boolean().default(false),
});

// ---------- Body de edição (tudo opcional) ----------

export const atualizarArtigoBodySchema = criarArtigoBodySchema.partial();

// ---------- Params ----------

export const artigoIdParamsSchema = z.object({
  id: z.uuid('id inválido'),
});

export const artigoSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

// ---------- Querystring de listagem ----------

export const listarArtigosQuerySchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  porPagina: z.coerce.number().int().min(1).max(50).default(9),
});

// ---------- Respostas ----------

export const listaArtigosResponseSchema = z.object({
  artigos: z.array(artigoResumoSchema),
  total: z.number(),
  pagina: z.number(),
  porPagina: z.number(),
});

export type CriarArtigoBody = z.infer<typeof criarArtigoBodySchema>;
export type AtualizarArtigoBody = z.infer<typeof atualizarArtigoBodySchema>;
