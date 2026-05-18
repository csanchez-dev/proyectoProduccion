import { Router } from 'express';
import { EventoController } from '../controllers/evento.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', EventoController.getEventos);
router.post('/', authMiddleware, EventoController.postEvento);

export default router;
