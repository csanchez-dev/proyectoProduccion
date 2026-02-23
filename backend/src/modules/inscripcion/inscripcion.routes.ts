import { Router } from 'express'
import { inscribirse } from './inscripcion.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

router.post('/', authMiddleware, inscribirse)

export default router