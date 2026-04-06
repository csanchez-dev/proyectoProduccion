// src/routes/usuario.routes.ts
import { Router } from 'express'
import * as controller from '../controllers/usuario.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

router.post('/register', controller.registerUser)
router.get('/me', authMiddleware, controller.getMyProfile)
router.put('/me', authMiddleware, controller.updateProfile)
router.get('/', authMiddleware, controller.getAllUsers)

export default router