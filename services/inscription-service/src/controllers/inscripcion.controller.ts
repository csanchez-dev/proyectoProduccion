// src/controllers/inscripcion.controller.ts
import { Request, Response } from 'express'
import * as service from '../services/inscripcion.service'

export const inscribirse = async (req: Request, res: Response) => {
  const userId = (req as any).user.id
  const { ponencia_id } = req.body

  const { data, error } = await service.crearInscripcion(userId, ponencia_id)
  if (error) return res.status(400).json({ error: (error as Error).message })
  res.status(201).json(data)
}

export const misInscripciones = async (req: Request, res: Response) => {
  const userId = (req as any).user.id
  const { data, error } = await service.obtenerMisInscripciones(userId)
  if (error) return res.status(400).json({ error: (error as Error).message })
  res.json(data)
}

export const actualizarAsistencia = async (req: Request, res: Response) => {
  const { id } = req.params
  const { asistio } = req.body

  const { data, error } = await service.marcarAsistencia(id as string, asistio)
  if (error) return res.status(400).json({ error: (error as Error).message })
  res.json(data)
}