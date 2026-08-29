-- CreateTable
CREATE TABLE "admins" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artigos" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(250) NOT NULL,
    "slug" VARCHAR(250) NOT NULL,
    "resumo" VARCHAR(500),
    "conteudo" TEXT NOT NULL,
    "imagem_capa" TEXT,
    "categoria" VARCHAR(100) NOT NULL DEFAULT 'Noticias',
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "autor_id" UUID,
    "data_publicacao" TIMESTAMPTZ(6),
    "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "artigos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "artigos_slug_key" ON "artigos"("slug");

-- CreateIndex
CREATE INDEX "artigos_slug_idx" ON "artigos"("slug");

-- CreateIndex
CREATE INDEX "artigos_publicado_data_publicacao_idx" ON "artigos"("publicado", "data_publicacao");

-- AddForeignKey
ALTER TABLE "artigos" ADD CONSTRAINT "artigos_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
