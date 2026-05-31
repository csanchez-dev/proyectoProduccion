// src/app.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import usuarioRoutes  from './routes/usuario.routes.js';

const app: Express = express();

// 1. Configuración de Helmet para Cabeceras de Seguridad HTTP
app.use(helmet());

// 2. Configuración de CORS segura y restrictiva
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost', 'http://localhost:5000', 'http://127.0.0.1:5173', 'http://127.0.0.1'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por la política CORS de auth-service'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Limitación de peticiones estricta para Login y Registro (mitiga fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  limit: 15, // Máximo 15 intentos por IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes de autenticación. Intente de nuevo en 5 minutos.' }
});

// 4. Parser de JSON con tamaño máximo restrictivo de 1MB para seguridad
app.use(express.json({ limit: '1mb' }));

// Health check (clave en microservicios)
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// Rutas
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/usuarios/register', authLimiter); // Aplicar límite estricto solo a la subruta de registro
app.use('/api/usuarios', usuarioRoutes);

export default app;