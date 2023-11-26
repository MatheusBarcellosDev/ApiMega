-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultadoMegaSena" (
    "id" TEXT NOT NULL,
    "acumulado" BOOLEAN,
    "dataApuracao" TEXT,
    "dataProximoConcurso" TEXT,
    "dezenasSorteadasOrdemSorteio" TEXT[],
    "exibirDetalhamentoPorCidade" BOOLEAN,
    "indicadorConcursoEspecial" INTEGER,
    "listaDezenas" TEXT[],
    "listaDezenasSegundoSorteio" TEXT,
    "listaResultadoEquipeEsportiva" TEXT[],
    "localSorteio" TEXT,
    "nomeMunicipioUFSorteio" TEXT,
    "nomeTimeCoracaoMesSorte" TEXT,
    "numero" INTEGER,
    "numeroConcursoAnterior" INTEGER,
    "numeroConcursoFinal_0_5" INTEGER,
    "numeroConcursoProximo" INTEGER,
    "numeroJogo" INTEGER,
    "observacao" TEXT,
    "premiacaoContingencia" TEXT,
    "tipoJogo" TEXT,
    "tipoPublicacao" INTEGER,
    "ultimoConcurso" BOOLEAN,
    "valorArrecadado" DOUBLE PRECISION,
    "valorAcumuladoConcurso_0_5" DOUBLE PRECISION,
    "valorAcumuladoConcursoEspecial" DOUBLE PRECISION,
    "valorAcumuladoProximoConcurso" DOUBLE PRECISION,
    "valorEstimadoProximoConcurso" DOUBLE PRECISION,
    "valorSaldoReservaGarantidora" DOUBLE PRECISION,
    "valorTotalPremioFaixaUm" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ResultadoMegaSena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ganhador" (
    "id" SERIAL NOT NULL,
    "ganhadores" INTEGER,
    "municipio" TEXT,
    "nomeFantasiaUL" TEXT,
    "posicao" INTEGER,
    "serie" TEXT,
    "uf" TEXT,
    "resultadoMegaSenaId" TEXT,

    CONSTRAINT "Ganhador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateioPremio" (
    "id" SERIAL NOT NULL,
    "descricaoFaixa" TEXT,
    "faixa" INTEGER,
    "numeroDeGanhadores" INTEGER,
    "valorPremio" DOUBLE PRECISION,
    "resultadoMegaSenaId" TEXT,

    CONSTRAINT "RateioPremio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "unique_ganhador" ON "Ganhador"("resultadoMegaSenaId", "posicao");

-- CreateIndex
CREATE INDEX "unique_rateio_premio" ON "RateioPremio"("resultadoMegaSenaId", "faixa");

-- AddForeignKey
ALTER TABLE "Ganhador" ADD CONSTRAINT "Ganhador_resultadoMegaSenaId_fkey" FOREIGN KEY ("resultadoMegaSenaId") REFERENCES "ResultadoMegaSena"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateioPremio" ADD CONSTRAINT "RateioPremio_resultadoMegaSenaId_fkey" FOREIGN KEY ("resultadoMegaSenaId") REFERENCES "ResultadoMegaSena"("id") ON DELETE SET NULL ON UPDATE CASCADE;
