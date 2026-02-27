import { Router } from 'express'
import * as controller from './ponencia.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

router.get('/', controller.getPonencias)
router.post('/', authMiddleware, controller.postPonencia)
router.delete('/:id', authMiddleware, controller.deletePonencia)

export default router