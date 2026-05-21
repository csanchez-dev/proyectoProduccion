import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import inscripcionRoutes from './src/routes/inscripcion.routes';

const app = express();

// 1. Cabeceras de seguridad con Helmet
app.use(helmet());

// 2. CORS restrictivo
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost', 'http://localhost:5000', 'http://127.0.0.1:5173', 'http://127.0.0.1'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por la política CORS de inscription-service'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Limitación de tamaño del JSON body a 2MB
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'inscription-service' });
});

app.use('/api/inscripciones', inscripcionRoutes);

export default app;
