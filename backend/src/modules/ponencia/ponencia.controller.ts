import { Request, Response } from 'express'
import * as service from './ponencia.service'

export const getPonencias = async (_: Request, res: Response) => {
  const { data, error } = await service.obtenerPonencias()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

export const postPonencia = async (req: Request, res: Response) => {
  const { data, error } = await service.crearPonencia(req.body)
  if (error) return res.status(403).json({ error: error.message })
  res.status(201).json(data)
}

export const deletePonencia = async (req: Request, res: Response) => {
  const { id } = req.params
  const { error } = await service.eliminarPonencia(id as string)
  if (error) return res.status(400).json({ error: error.message })
  res.status(204).send()
}