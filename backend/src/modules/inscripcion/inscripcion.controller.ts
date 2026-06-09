import { Request, Response } from 'express'
import * as service from './inscripcion.service'
import { publicarInscripcion } from '../../services/rabbitmq.service'

export const inscribirse = async (req: Request, res: Response) => {
  // 1. Extraer datos del usuario (autenticado por middleware) y del cuerpo de la petición
  const userId = (req as any).user.id
  const { ponencia_id } = req.body

  // 2. Intentar guardar en la base de datos (Supabase)
  const { data, error } = await service.crearInscripcion(userId, ponencia_id)

  // 3. Si hay un error en la DB, respondemos de inmediato y no enviamos nada a RabbitMQ
  if (error) {
    return res.status(400).json({ error: error.message })
  }

  /**
   * 4. ÉXITO: El registro ya está en Supabase.
   * Ahora enviamos un mensaje a RabbitMQ para tareas en segundo plano
   * (ej: enviar un email de confirmación o generar un ticket).
   * No usamos 'await' aquí para que la respuesta al usuario sea instantánea.
   */
  publicarInscripcion({
    inscripcionId: data[0]?.id, // Suponiendo que Supabase retorna el ID creado
    userId,
    ponencia_id,
    fecha: new Date().toISOString()
  });

  // 5. Responder al cliente
  res.status(201).json({
    message: 'Inscripción realizada con éxito y procesando notificaciones.',
    data
  })
}

export const misInscripciones = async (req: Request, res: Response) => {
  const userId = (req as any).user.id
  const { data, error } = await service.obtenerMisInscripciones(userId)

  if (error) return res.status(400).json({ error: error.message })

  res.json(data)
}