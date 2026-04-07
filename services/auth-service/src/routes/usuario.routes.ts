// src/routes/usuario.routes.ts
import { Router } from 'express';
import * as controller from '../controllers/usuario.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/roles.middleware.js';
import { TipoUsuario } from '@prisma/client';

const router = Router();

router.post('/register', controller.registerUser);
router.get('/me', authMiddleware, controller.getMyProfile);
router.put('/me', authMiddleware, controller.updateProfile);

// Solo admins pueden ver todos los usuarios
router.get('/', authMiddleware, authorize(TipoUsuario.admin), controller.getAllUsers);

export default router;