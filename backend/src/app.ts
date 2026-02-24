import express from 'express'
import cors from 'cors'

import usuarioRoutes from './modules/usuario/usuario.routes'
import eventoRoutes from './modules/evento/evento.routes'
import ponenciaRoutes from './modules/ponencia/ponencia.routes'
import inscripcionRoutes from './modules/inscripcion/inscripcion.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/usuarios', usuarioRoutes)
app.use('/api/eventos', eventoRoutes)
app.use('/api/ponencias', ponenciaRoutes)
app.use('/api/inscripciones', inscripcionRoutes)

export default app