import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import * as controller from './usuario.controller'
import { registerUserSchema, loginUserSchema, crearPerfilSchema, actualizarPerfilSchema } from './usuario.dto'
import { validate } from './usuario.controller' // Assuming validate is exported from controller

const router = Router()

router.post('/register', validate(registerUserSchema), controller.registerUser)
router.post('/login', validate(loginUserSchema), controller.loginUser)
router.get('/perfil', authMiddleware, controller.obtenerPerfil)
router.post('/perfil', authMiddleware, validate(crearPerfilSchema), controller.crearPerfil)
router.put('/perfil', authMiddleware, validate(actualizarPerfilSchema), controller.actualizarPerfil)
router.get('/', authMiddleware, controller.obtenerUsuarios)

export default router