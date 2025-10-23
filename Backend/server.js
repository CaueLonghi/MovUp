import express from 'express';
import userRoutes from './API/user_api.js'; 
import fichaRoutes from './API/ficha_api.js';
import analiseRoutes from './API/analise_api.js';


const app = express();

app.use(express.json());

app.use('/users', userRoutes);
app.use('/fichas', fichaRoutes);
app.use('/analises', analiseRoutes);

app.get('/', (req, res) => {
  res.send('Servidor rodando');
});

app.listen(3000, () => {
  console.log('http://localhost:3000');
});

