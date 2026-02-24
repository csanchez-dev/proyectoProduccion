import { Request, Response } from 'express'
import * as service from './usuario.service'

export const crearMiPerfil = async (req: Request, res: Response) => {
  const userId = (req as any).user.id
  const { data, error } = await service.crearPerfil(userId, req.body)

  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
}

export const obtenerPerfil = async (req: Request, res: Response) => {
  const userId = (req as any).user.id
  const { data, error } = await service.obtenerMiPerfil(userId)

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}