import express from 'express'
import cors from 'cors'

import eventoRoutes from './src/routes/evento.routes'
import ponenciaRoutes from './src/routes/ponencia.routes'
import ponenteRoutes from './src/routes/ponente.routes'

const app = express()
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'agenda-service' }))

// Routes
app.use('/api/eventos', eventoRoutes)
app.use('/api/ponencias', ponenciaRoutes)
app.use('/api/ponentes', ponenteRoutes)

export default app