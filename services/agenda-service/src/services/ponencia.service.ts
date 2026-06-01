import { prisma } from '../config/prisma'

export const obtenerPonencias = async () => {
  try {
    const ponencias = await prisma.ponencia.findMany({
      include: {
        sala: true,
        diaEvento: true,
        ponentes: { include: { ponente: true } }
      }
    })
    return { data: ponencias }
  } catch (error) {
    return { data: null, error }
  }
}

export const crearPonencia = async (data: any) => {
  try {
    const ponencia = await prisma.ponencia.create({ data })
    return { data: ponencia }
  } catch (error) {
    return { data: null, error }
  }
}

export const actualizarPonencia = async (id: string, data: any) => {
  try {
    const ponencia = await prisma.ponencia.update({
      where: { id },
      data
    })
    return { data: ponencia }
  } catch (error) {
    return { data: null, error }
  }
}

export const eliminarPonencia = async (id: string) => {
  try {
    await prisma.ponencia.delete({ where: { id } })
    return { data: true }
  } catch (error) {
    return { data: null, error }
  }
}