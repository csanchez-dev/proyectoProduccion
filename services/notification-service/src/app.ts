import express from 'express';
import cors from 'cors';
import notificationRoutes from './routes/notificationRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/notifications', notificationRoutes);

export default app;