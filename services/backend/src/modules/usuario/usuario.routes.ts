import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import * as controller from './usuario.controller'

const router = Router()

router.post('/register', controller.registerUser)
router.post('/login', controller.loginUser)
router.get('/perfil', authMiddleware, controller.obtenerPerfil)
router.post('/perfil', authMiddleware, controller.crearPerfil)
router.put('/perfil', authMiddleware, controller.actualizarPerfil)
router.get('/', authMiddleware, controller.obtenerUsuarios)

export default router