import express from "express";
import { PrismaClient } from '../generated/prisma/index.js';
const router = express.Router();
const prisma = new PrismaClient();


router.use(express.json());

router.post("/", async (req, res) => {
  const { userId, data } = req.body;

  if (!userId || !data) {
    return res.status(400).json({ error: "userId" });
  }

  const bufferData = Buffer.from(JSON.stringify(data));

  const analise = await prisma.analise.create({
    data: {
      userId,
      data: bufferData,
    },
  });

  res.status(201).json({ message: "Criado", analise });
});

router.get("/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  const analises = await prisma.analise.findMany({
    where: { userId },
  });

  const analisesJson = analises.map(a => ({
    id: a.id,
    userId: a.userId,
    data: JSON.parse(a.data.toString())
  }));

  res.json(analisesJson);
});

export default router;
