import { Router } from 'express'
import * as controller from './evento.controller'
import { verifyToken } from '../../middleware/auth.middleware'

const router = Router()

router.get('/', controller.getEventos)
router.post('/', verifyToken, controller.postEvento)

export default router