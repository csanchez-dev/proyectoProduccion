import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';

const router = Router();

router.get('/', notificationController.getAll);
router.get('/unread', notificationController.getUnread);
router.post('/', notificationController.create);
router.patch('/:id/read', notificationController.markAsRead);

export default router;