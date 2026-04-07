import { Router } from 'express'
import * as controller from '../controllers/evento.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', controller.getEventos)
router.post('/', authMiddleware, controller.postEvento)

export default router