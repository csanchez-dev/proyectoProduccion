import { Router } from 'express'
import * as controller from './ponencia.controller'
import { verifyToken } from '../../middleware/auth.middleware'

const router = Router()

router.get('/', controller.getPonencias)
router.post('/', verifyToken, controller.postPonencia)
router.delete('/:id', verifyToken, controller.deletePonencia)

export default router