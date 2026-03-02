import { Router } from 'express'
import { verifyToken } from '../../middleware/auth.middleware'
import * as controller from './usuario.controller'

const router = Router()

router.get('/perfil', verifyToken, controller.obtenerPerfil)
router.post('/perfil', verifyToken, controller.crearPerfil)

export default router