import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import * as controller from './usuario.controller'

const router = Router()

router.post('/register', controller.registerUser)
router.get('/perfil', authMiddleware, controller.obtenerPerfil)
router.post('/perfil', authMiddleware, controller.crearPerfil)



export default router