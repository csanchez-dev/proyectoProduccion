import { Router } from 'express'
import * as controller from './ponente.controller'
import { verifyToken } from '../../middleware/auth.middleware'

const router = Router()

router.get('/', controller.getPonentes)
router.post('/', verifyToken, controller.postPonente)

export default router
