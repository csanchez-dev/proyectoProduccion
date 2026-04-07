import { Request, Response } from 'express'
import * as service from '../services/ponente.service'

export const getPonentes = async (_: Request, res: Response) => {
  const { data, error } = await service.obtenerPonentes()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

export const postPonente = async (req: Request, res: Response) => {
  const { data, error } = await service.crearPonente(req.body)
  if (error) return res.status(403).json({ error: error.message })
  res.status(201).json(data)
}