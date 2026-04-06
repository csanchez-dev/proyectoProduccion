// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' })
    }

    const token = authHeader.split(' ')[1]

    const decoded = verifyToken(token) as any

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      rol: decoded.rol
    }

    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }
}