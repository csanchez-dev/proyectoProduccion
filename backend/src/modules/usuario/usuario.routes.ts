import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import * as controller from './usuario.controller'

const router = Router()

router.post('/perfil', authMiddleware, controller.crearMiPerfil)
router.get('/perfil', authMiddleware, controller.obtenerPerfil)

export default router