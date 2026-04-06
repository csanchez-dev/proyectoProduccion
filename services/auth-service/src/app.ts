// src/app.ts
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.routes'
import usuarioRoutes from './routes/usuario.routes'

const app = express()

// Middlewares globales
app.use(cors())
app.use(express.json())

// Health check (clave en microservicios)
app.get('/health', (_, res) => {
  res.json({ status: 'ok', service: 'auth-service' })
})

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/usuarios', usuarioRoutes)

export default app