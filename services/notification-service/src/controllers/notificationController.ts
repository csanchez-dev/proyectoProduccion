import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService';

export const notificationController = {
  async getAll(_req: Request, res: Response) {
    const notifications = await notificationService.getAll();
    res.json(notifications);
  },

  async getUnread(_req: Request, res: Response) {
    const notifications = await notificationService.getUnread();
    res.json(notifications);
  },

  async create(req: Request, res: Response) {
    const { type, title, message } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({
        message: 'type, title and message are required',
      });
    }

    const notification = await notificationService.create({
      type,
      title,
      message,
    });

    return res.status(201).json(notification);
  },

  async markAsRead(req: Request, res: Response) {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.json(notification);
  },
};