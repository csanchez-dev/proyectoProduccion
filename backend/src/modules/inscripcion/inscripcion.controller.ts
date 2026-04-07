import { Request, Response } from 'express'
import * as service from './inscripcion.service'
import { publishEvent } from '../../config/rabbitmq'

export const inscribirse = async (req: Request, res: Response) => {
  const userId = (req as any).user.id
  const { ponencia_id } = req.body

  const { data, error } =
    await service.crearInscripcion(userId, ponencia_id)

  if (error) return res.status(400).json({ error: error.message })

  // [Julián - RabbitMQ] Publicamos el evento de nueva inscripción
  await publishEvent('inscripciones_queue', {
    tipo: 'NUEVA_INSCRIPCION',
    userId,
    ponencia_id,
    fecha: new Date(),
    detalles: data
  });

  res.status(201).json(data)
}

export const misInscripciones = async (req: Request, res: Response) => {
  const userId = (req as any).user.id
  const { data, error } =
    await service.obtenerMisInscripciones(userId)

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}