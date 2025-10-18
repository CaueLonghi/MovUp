import express from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../generated/prisma/index.js'; 
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, nome, birthday, senha } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const user = await prisma.user.create({
      data: {
        email,
        nome,
        birthday: new Date(birthday),
        senha: hashedPassword
      },
    });

    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});


router.get('/', async (req, res) => {
  const users = await prisma.user.findMany();
  res.status(200).json(users);
});

router.delete('/:id', async (req, res) => {
  const userId = req.params.id;
  const userName = req.params.nome

  const deletedUser = await prisma.user.delete({
    where: { id: parseInt(userId) },
  });

  res.status(200).json({
    message: `Usuário com id ${userId} e nome ${userName}deletado com sucesso!`,
  });
});



router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ error: 'Usuário não encontrado.' });
  }

  const isPasswordValid = await bcrypt.compare(senha, user.senha);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Senha incorreta.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    'chave-secreta-super-segura', 
    { expiresIn: '2h' }
  );

  res.json({ message: 'Login realizado com sucesso!', token });
});

export default router;
