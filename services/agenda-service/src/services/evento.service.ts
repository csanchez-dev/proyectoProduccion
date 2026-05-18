import { prisma } from '../config/prisma'

export const obtenerEventos = async () => {
  try {
    const eventos = await prisma.evento.findMany()
    return { data: eventos }
  } catch (error) {
    return { data: null, error: (error as any).message }
  }
}

export const crearEvento = async (data: any) => {
  try {
    const evento = await prisma.evento.create({ data })
    return { data: evento }
  } catch (error) {
    return { data: null, error: (error as any).message }
  }
}