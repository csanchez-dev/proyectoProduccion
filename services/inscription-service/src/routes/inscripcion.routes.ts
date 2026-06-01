// src/routes/inscripcion.routes.ts
import { Router } from 'express'
import * as controller from '../controllers/inscripcion.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/', authMiddleware, controller.inscribirse)
router.get('/mis-inscripciones', authMiddleware, controller.misInscripciones)
router.patch('/:id/asistencia', authMiddleware, controller.actualizarAsistencia)

export default router