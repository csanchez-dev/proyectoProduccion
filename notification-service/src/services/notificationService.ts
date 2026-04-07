import crypto from 'crypto';
import pool from '../config/database';
import { Notification } from '../models/Notification';

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const result = await pool.query(`
      SELECT 
        id, 
        type, 
        title, 
        message, 
        created_at AS "createdAt", 
        read
      FROM notifications
      ORDER BY created_at DESC
    `);

    return result.rows;
  },

  async getUnread(): Promise<Notification[]> {
    const result = await pool.query(`
      SELECT 
        id, 
        type, 
        title, 
        message, 
        created_at AS "createdAt", 
        read
      FROM notifications
      WHERE read = FALSE
      ORDER BY created_at DESC
    `);

    return result.rows;
  },

  async create(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      ...notification,
      createdAt: new Date().toISOString(),
      read: false,
    };

    await pool.query(
      `
      INSERT INTO notifications (id, type, title, message, created_at, read)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [
        newNotification.id,
        newNotification.type,
        newNotification.title,
        newNotification.message,
        new Date(newNotification.createdAt),
        newNotification.read,
      ]
    );

    return newNotification;
  },

  async markAsRead(id: string | string[]): Promise<Notification | null> {
    const result = await pool.query(
      `
      UPDATE notifications
      SET read = TRUE
      WHERE id = $1
      RETURNING 
        id, 
        type, 
        title, 
        message, 
        created_at AS "createdAt", 
        read
    `,
      [id]
    );

    return result.rows[0] || null;
  },
};