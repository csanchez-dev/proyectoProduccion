import { Router } from 'express'
import * as controller from '../controllers/ponente.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', controller.getPonentes)
router.post('/', authMiddleware, controller.postPonente)

export default router