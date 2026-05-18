import { prisma } from '../config/prisma'

export const obtenerPonentes = async () => {
  try {
    const ponentes = await prisma.ponente.findMany()
    return { data: ponentes }
  } catch (error) {
    return { data: null, error }
  }
}

export const crearPonente = async (data: any) => {
  try {
    const ponente = await prisma.ponente.create({ data })
    return { data: ponente }
  } catch (error) {
    return { data: null, error }
  }
}