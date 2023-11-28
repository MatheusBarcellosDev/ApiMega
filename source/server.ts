import { PrismaClient, User } from '@prisma/client';
import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = fastify();

const prisma = new PrismaClient();

const JWT_SECRET = 'secreto';

const tokenBlacklist: string[] = [];

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    userId: string;
    email: string;
  };
}

const generateAuthToken = (user: User) => {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '1h',
  });
};

const validatePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};

app.post<{ Body: { email: string; password: string } }>(
  '/auth/login',
  async (request, reply) => {
    const { email, password } = request.body;

    // Verifique as credenciais no banco de dados
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !(await validatePassword(password, user.password))) {
      reply.status(401).send({ error: 'Credenciais inválidas' });
      return;
    }

    // Gere um token de autenticação (JWT)
    const token = generateAuthToken(user);

    reply.status(200).send({ token });
  }
);

// Middleware de autenticação
const authenticate = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
) => {
  const token = request.headers['authorization'];

  if (!token || tokenBlacklist.includes(token)) {
    reply.status(401).send({ error: 'Token inválido ou expirado' });
    return;
  }

  try {
    // Verifica se o token é válido
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };
    request.user = decoded; // Adiciona o usuário decodificado ao objeto de solicitação
  } catch (error) {
    reply.status(401).send({ error: 'Token inválido ou expirado' });
    return;
  }
};

app.post('/auth/logout', async (request, reply) => {
  const tokenToRevoke = request.headers['authorization'];

  if (!tokenToRevoke) {
    reply.status(401).send({ error: 'Token de autenticação não fornecido' });
    return;
  }

  // Adiciona o token à lista negra
  tokenBlacklist.push(tokenToRevoke);

  reply.status(200).send({ message: 'Logout realizado com sucesso' });
});

app.get('/users', async () => {
  const users = await prisma.user.findMany();

  return { users };
});

app.get(
  '/auth/user',
  { preHandler: authenticate },
  async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const user = request.user; // Usuário já está disponível após a autenticação
      reply.send({ user });
    } catch (error) {
      console.error(error);
      reply
        .status(500)
        .send({ error: 'Erro ao obter detalhes do usuário autenticado' });
    }
  }
);

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

app.post(
  '/resultados-megasena',
  { preHandler: authenticate },
  async (request, reply) => {
    try {
      const resultadosMegaSena = await prisma.resultadoMegaSena.findMany();

      reply.send({ resultadosMegaSena });
    } catch (error) {
      console.error(error);
      reply
        .status(500)
        .send({ error: 'Erro ao buscar resultados da Mega Sena' });
    }
  }
);

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

app.delete<{ Params: { id: string } }>(
  '/resultados-megasena/:id',
  { preHandler: authenticate },
  async (request, reply) => {
    try {
      const { id } = request.params;

      const jogoExcluido = await prisma.resultadoMegaSena.delete({
        where: {
          id: id,
        },
      });

      reply.send({
        mensagem: `Jogo ${id} excluído com sucesso.`,
        jogoExcluido,
      });
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: 'Erro ao excluir o jogo' });
    }
  }
);

app
  .listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
  })
  .then(() => {
    console.log('Server is running');
  });
