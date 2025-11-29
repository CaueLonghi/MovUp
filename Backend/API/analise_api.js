import express from "express";
import { PrismaClient } from '../generated/prisma/index.js';
const router = express.Router();
const prisma = new PrismaClient();


router.use(express.json());

// Função auxiliar para converter dados do Prisma Bytes para Buffer
const convertToBuffer = (data) => {
  if (Buffer.isBuffer(data)) {
    return data;
  }
  // Se for um objeto com índices numéricos (serialização do Buffer pelo Prisma)
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const keys = Object.keys(data)
      .map(k => parseInt(k))
      .filter(k => !isNaN(k) && k >= 0)
      .sort((a, b) => a - b);
    
    if (keys.length > 0) {
      // Criar array de bytes a partir dos valores do objeto
      const bufferArray = [];
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        // Tentar acessar como string primeiro (mais comum), depois como número
        const value = data[key.toString()] !== undefined ? data[key.toString()] : data[key];
        if (value !== undefined && value !== null) {
          const byteValue = typeof value === 'number' 
            ? value & 0xFF 
            : parseInt(value) & 0xFF;
          bufferArray.push(byteValue);
        }
      }
      if (bufferArray.length > 0) {
        return Buffer.from(bufferArray);
      }
    }
  }
  return null;
};

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

  // Não retornar o campo data (que é um Buffer) na resposta
  const { data: _, ...analiseWithoutData } = analise;

  res.status(201).json({ 
    message: "Criado", 
    analise: analiseWithoutData,
    report_id: analise.id 
  });
});

router.get("/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  const analises = await prisma.analise.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }, // Ordenar por data de criação (mais recente primeiro)
  });

  const analisesJson = analises.map(a => {
    try {
      // Converter o campo data (que pode vir como objeto com índices ou Buffer) para Buffer
      const buffer = convertToBuffer(a.data);
      
      if (!buffer) {
        throw new Error('Não foi possível converter os dados para Buffer');
      }

      // Converter Buffer para string UTF-8 e depois fazer parse do JSON
      const dataString = buffer.toString('utf8');
      const parsedData = JSON.parse(dataString);
      
      return {
        id: a.id,
        userId: a.userId,
        createdAt: a.createdAt,
        data: parsedData
      };
    } catch (error) {
      console.error('Erro ao fazer parse do JSON:', error);
      console.error('Dados recebidos:', a.data);
      return {
    id: a.id,
    userId: a.userId,
        createdAt: a.createdAt,
        data: null,
        error: 'Erro ao processar dados'
      };
    }
  });

  res.json(analisesJson);
});

export default router;
