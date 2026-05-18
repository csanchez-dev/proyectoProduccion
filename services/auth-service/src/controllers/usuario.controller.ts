// src/controllers/usuario.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { TipoUsuario } from '@prisma/client';

// 🟢 Registro (usuario + perfil)
export const registerUser = async (req: Request, res: Response) => {
  const { email, password, nombres, apellidos, universidad, tipo_usuario } = req.body;

  try {
    const exists = await prisma.usuario.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'El email ya está registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.usuario.create({
        data: { email, password_hash: hashedPassword },
      });

      await tx.perfilUsuario.create({
        data: {
          id: newUser.id,
          nombres,
          apellidos,
          universidad,
          tipo_usuario: tipo_usuario || TipoUsuario.estudiante,
        },
      });

      return newUser;
    });

    return res.status(201).json({ message: 'Usuario creado correctamente', userId: user.id });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// 🔵 Obtener mi perfil
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const perfil = await prisma.perfilUsuario.findUnique({
      where: { id: userId },
    });

    if (!perfil) return res.status(404).json({ error: 'Perfil no encontrado' });

    return res.json(perfil);
  } catch {
    return res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// 🟡 Actualizar perfil
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { nombres, apellidos, universidad } = req.body;

    const updated = await prisma.perfilUsuario.update({
      where: { id: userId },
      data: { nombres, apellidos, universidad },
    });

    return res.json({ message: 'Perfil actualizado', data: updated });
  } catch {
    return res.status(400).json({ error: 'No se pudo actualizar' });
  }
};

// 🔴 Obtener todos los usuarios (admin)
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.usuario.findMany({ include: { perfil: true } });
    return res.json(users);
  } catch {
    return res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};