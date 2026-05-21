import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

const app = express();

// 1. Configuración de Helmet para Cabeceras de Seguridad HTTP
app.use(helmet());

// 2. Configuración de CORS dinámica y segura
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost', 'http://127.0.0.1:5173', 'http://127.0.0.1'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como apps móviles, curl o peticiones entre contenedores si aplica)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por la política CORS del Gateway'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Limitación de Tasa (Rate Limiting) global para protección DDoS básica
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 150, // Límite de 150 peticiones por IP por ventana
  standardHeaders: 'draft-7', // Retornar cabeceras estándar RateLimit-*
  legacyHeaders: false, // Desactivar cabeceras X-RateLimit-*
  message: { error: 'Demasiadas solicitudes desde esta IP, intente de nuevo en 15 minutos.' }
});
app.use(globalLimiter);

// 4. Reducción de los límites de tamaño en el parser de JSON/URLencoded
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

// URLs de los Microservicios (pueden venir de env vars) lugar de la red de doker
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
const AGENDA_SERVICE_URL = process.env.AGENDA_SERVICE_URL || 'http://agenda-service:3001';
const INSCRIPTION_SERVICE_URL = process.env.INSCRIPTION_SERVICE_URL || 'http://inscription-service:3002';
// verifiacion gateway
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', component: 'api-gateway' });
});

// Proxy routes, redireccion de trafico
app.use('/api/auth', proxy(AUTH_SERVICE_URL));
app.use('/api/usuarios', proxy(AUTH_SERVICE_URL));
app.use('/api/eventos', proxy(AGENDA_SERVICE_URL));
app.use('/api/ponencias', proxy(AGENDA_SERVICE_URL));
app.use('/api/ponentes', proxy(AGENDA_SERVICE_URL));
app.use('/api/inscripciones', proxy(INSCRIPTION_SERVICE_URL));

export default app;