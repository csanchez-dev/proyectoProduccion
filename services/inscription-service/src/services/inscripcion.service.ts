// src/services/inscripcion.service.ts
import { prisma } from '../config/prisma'

export const crearInscripcion = async (
  usuario_id: string,
  ponencia_id: string
) => {
  try {
    const inscripcion = await prisma.inscripcionPonencia.create({
      data: {
        usuarioId: usuario_id,
        ponenciaId: ponencia_id
      }
    })
    return { data: inscripcion }
  } catch (error) {
    return { data: null, error }
  }
}

export const obtenerMisInscripciones = async (usuario_id: string) => {
  try {
    const inscripciones = await prisma.inscripcionPonencia.findMany({
      where: { usuarioId: usuario_id },
      include: { ponencia: true }
    })
    return { data: inscripciones }
  } catch (error) {
    return { data: null, error }
  }
}

export const marcarAsistencia = async (
  inscripcion_id: string,
  asistio: boolean
) => {
  try {
    const inscripcion = await prisma.inscripcionPonencia.update({
      where: { id: inscripcion_id },
      data: { asistio }
    })
    return { data: inscripcion }
  } catch (error) {
    return { data: null, error }
  }
}