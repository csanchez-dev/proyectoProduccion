import { Router } from 'express'
import { verifyToken } from '../../middleware/auth.middleware'
import * as controller from './inscripcion.controller'

const router = Router()

router.post('/', verifyToken, controller.inscribirse)
router.get('/mis-inscripciones', verifyToken, controller.misInscripciones)

export default router