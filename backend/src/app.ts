import express from 'express'
import cors from 'cors'
import inscripcionRoutes from './modules/inscripcion/inscripcion.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/inscripciones', inscripcionRoutes)

export default app