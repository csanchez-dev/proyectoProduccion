import { Router } from 'express'
import * as controller from '../controllers/ponencia.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

router.get('/', controller.getPonencias)
router.post('/', authMiddleware, controller.postPonencia)
router.put('/:id', authMiddleware, controller.putPonencia)
router.delete('/:id', authMiddleware, controller.deletePonencia)

export default router