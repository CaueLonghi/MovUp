import express from 'express';
import userRoutes from './API/user_api.js'; 
import fichaRoutes from './API/ficha_api.js';

const app = express();

app.use(express.json());

app.use('/users', userRoutes);
app.use('/fichas', fichaRoutes);

app.get('/', (req, res) => {
  res.send('Servidor rodando normalmente 🚀');
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
