import { PrismaClient } from '@prisma/client';
import fastify from 'fastify';
import { z } from 'zod';

const app = fastify();

const prisma = new PrismaClient();

app.get('/users', async () => {
  const users = await prisma.user.findMany();

  return { users };
});

app.post('/users', async (request, replay) => {
  const createUserSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
  });

  const { name, email, password } = createUserSchema.parse(request.body);

  await prisma.user.create({
    data: {
      name,
      email,
      password,
    },
  });

  replay.status(201).send();
});

app.get('/resultados-megasena', async (request, reply) => {
  try {
    const resultadosMegaSena = await prisma.resultadoMegaSena.findMany();

    reply.send({ resultadosMegaSena });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: 'Erro ao buscar resultados da Mega Sena' });
  }
});

// Rota para criar um novo resultado da Mega Sena
app.post('/resultados-megasena', async (request, reply) => {
  try {
    const createResultadoMegaSenaSchema = z.object({
      acumulado: z.boolean(),
      dataApuracao: z.string(),
      dataProximoConcurso: z.string(),
      dezenasSorteadasOrdemSorteio: z.array(z.string()),
      exibirDetalhamentoPorCidade: z.boolean(),
      indicadorConcursoEspecial: z.number(),
      listaDezenas: z.array(z.string()),
      listaDezenasSegundoSorteio: z.string().nullable(),
      listaMunicipioUFGanhadores: z.array(
        z.object({
          ganhadores: z.number(),
          municipio: z.string().nullable(),
          nomeFantasiaUL: z.string().nullable(),
          posicao: z.number(),
          serie: z.string().nullable(),
          uf: z.string(),
        })
      ),
      listaRateioPremio: z.array(
        z.object({
          descricaoFaixa: z.string().nullable(),
          faixa: z.number(),
          numeroDeGanhadores: z.number().nullable(),
          valorPremio: z.number().nullable(),
        })
      ),
      listaResultadoEquipeEsportiva: z.array(z.string()),
      localSorteio: z.string(),
      nomeMunicipioUFSorteio: z.string(),
      nomeTimeCoracaoMesSorte: z.string().nullable(),
      numero: z.number(),
      numeroConcursoAnterior: z.number().nullable(),
      numeroConcursoFinal_0_5: z.number(),
      numeroConcursoProximo: z.number(),
      numeroJogo: z.number(),
      observacao: z.string().nullable(),
      premiacaoContingencia: z.string().nullable(),
      tipoJogo: z.string(),
      tipoPublicacao: z.number(),
      ultimoConcurso: z.boolean(),
      valorArrecadado: z.number(),
      valorAcumuladoConcurso_0_5: z.number(),
      valorAcumuladoConcursoEspecial: z.number(),
      valorAcumuladoProximoConcurso: z.number(),
      valorEstimadoProximoConcurso: z.number(),
      valorSaldoReservaGarantidora: z.number(),
      valorTotalPremioFaixaUm: z.number(),
    });

    const data = createResultadoMegaSenaSchema.parse(request.body);

    const novoResultadoMegaSena = await prisma.resultadoMegaSena.create({
      data: {
        ...data,
        listaMunicipioUFGanhadores: {
          create: data.listaMunicipioUFGanhadores.map((ganhador) => ({
            ...ganhador,
          })),
        },
        listaRateioPremio: {
          create: data.listaRateioPremio.map((rateio) => ({
            ...rateio,
          })),
        },
      },
    });

    reply.status(201).send({ resultadoMegaSena: novoResultadoMegaSena });
  } catch (error) {
    console.error(error);
    reply.status(400).send({ error: 'Erro na validação dos dados' });
  }
});

app
  .listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
  })
  .then(() => {
    console.log('Server is running');
  });
