// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      rol: decoded.rol
    }
    next()
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' })
  }
}