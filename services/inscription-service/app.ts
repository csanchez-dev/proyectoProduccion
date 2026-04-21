import express from 'express';
import cors from 'cors';
import inscripcionRoutes from './src/routes/inscripcion.routes';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'inscription-service' });
});

app.use('/api/inscripciones', inscripcionRoutes);

export default app;
