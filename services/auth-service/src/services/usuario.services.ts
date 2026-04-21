// src/services/usuario.services.ts
import { prisma } from '../config/prisma.js';
import { Usuario, PerfilUsuario } from '@prisma/client';

// Retorna usuario con perfil
export const obtenerMiPerfil = async (id: string): Promise<(Usuario & { perfil: PerfilUsuario | null }) | null> => {
  return await prisma.usuario.findUnique({
    where: { id },
    include: { perfil: true },
  });
};