import express from 'express';
import cors from 'cors';
import userRoutes from './API/user_api.js'; 
import fichaRoutes from './API/ficha_api.js';
import analiseRoutes from './API/analise_api.js';


const app = express();

// Configurar CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/users', userRoutes);
app.use('/fichas', fichaRoutes);
app.use('/analises', analiseRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Servidor rodando' });
});

app.listen(8080, () => {
  console.log('Servidor rodando em http://localhost:8080');
});

