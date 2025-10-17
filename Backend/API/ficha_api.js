import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (req, res) => {
  const {
    peso,
    altura,
    sexo,
    Fascite_plantar,
    Fratura_inferior,
    Tendinite,
    Canelite,
    Diabetes,
    Colesterol,
    Tempo_corrida,
    userId,
  } = req.body;

  const ficha = await prisma.fichaMedica.create({
    data: {
      peso: parseFloat(peso),
      altura: parseFloat(altura),
      sexo,
      Fascite_plantar: Boolean(Fascite_plantar),
      Fratura_inferior: Boolean(Fratura_inferior),
      Tendinite: Boolean(Tendinite),
      Canelite: Boolean(Canelite),
      Diabetes: Boolean(Diabetes),
      Colesterol: Boolean(Colesterol),
      Tempo_corrida: parseFloat(Tempo_corrida),
      user: {
        connect: { id: parseInt(userId) }, 
      },
    },
  });

  res.status(201).json(ficha);
});

router.delete('/:id', async (req, res) => {
  const fichaId = parseInt(req.params.id);

  const ficha = await prisma.fichaMedica.findUnique({
    where: { id: fichaId },
    include: { user: true },
  });

  await prisma.fichaMedica.delete({
    where: { id: fichaId },
  });

  res.status(200).json({
    message: `Ficha médica do usuário "${ficha.user.nome}" (id ${ficha.userId}) deletada com sucesso!`,
  });
});

export default router;
