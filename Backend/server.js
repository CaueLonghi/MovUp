import express from 'express';
import userRoutes from './API/user_api.js'; 
import fichaRoutes from './API/ficha_api.js';

const app = express();

// Habilita o uso de JSON no corpo das requisições
app.use(express.json());

// Rotas principais
app.use('/users', userRoutes);
app.use('/fichas', fichaRoutes);

// Rota padrão de teste
app.get('/', (req, res) => {
  res.send('Servidor rodando normalmente 🚀');
});

// Inicializa o servidor
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
