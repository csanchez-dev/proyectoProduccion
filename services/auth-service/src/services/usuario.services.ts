import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const obtenerMiPerfil = async (id: number) => {
  return await prisma.usuario.findUnique({
    where: { id }
  })
}