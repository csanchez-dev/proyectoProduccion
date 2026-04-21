import { Request, Response } from 'express'
import * as service from '../services/evento.service'

export const getEventos = async (_: Request, res: Response) => {
  const { data, error } = await service.obtenerEventos()
  if (error) return res.status(400).json({ error: (error as Error).message })
  res.json(data)
}

export const postEvento = async (req: Request, res: Response) => {
  const { data, error } = await service.crearEvento(req.body)
  if (error) return res.status(403).json({ error: (error as Error).message })
  res.status(201).json(data)
}