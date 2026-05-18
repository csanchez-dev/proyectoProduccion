// src/middlewares/roles.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { TipoUsuario } from '@prisma/client';

export const authorize = (...roles: TipoUsuario[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.rol as TipoUsuario)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};