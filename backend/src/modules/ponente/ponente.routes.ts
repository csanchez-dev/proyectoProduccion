import { Router } from 'express'
import * as controller from './ponente.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

router.get('/', controller.getPonentes)
router.post('/', authMiddleware, controller.postPonente)

export default router
