import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
// activacion
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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