// src/app.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import usuarioRoutes  from './routes/usuario.routes.js';

const app: Express = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Health check (clave en microservicios)
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);

export default app;