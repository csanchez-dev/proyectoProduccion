import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import eventoRoutes from './src/routes/evento.routes'
import ponenciaRoutes from './src/routes/ponencia.routes'
import ponenteRoutes from './src/routes/ponente.routes'

const app = express()

// 1. Cabeceras de seguridad con Helmet
app.use(helmet())

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
      callback(new Error('No permitido por la política CORS de agenda-service'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Limitación de tamaño del JSON body parser a 2MB
app.use(express.json({ limit: '2mb' }))

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'agenda-service' }))

// Routes
app.use('/api/eventos', eventoRoutes)
app.use('/api/ponencias', ponenciaRoutes)
app.use('/api/ponentes', ponenteRoutes)

export default app