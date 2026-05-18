// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { generateToken } from '../utils/jwt.js';
import { TipoUsuario } from '@prisma/client';

// 🔵 LOGIN
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.usuario.findUnique({
      where: { email },
      include: { perfil: true },
    });

    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });
    if (!user.activo) return res.status(403).json({ error: 'Usuario inactivo' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Contraseña incorrecta' });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      rol: user.perfil?.tipo_usuario || TipoUsuario.invitado,
    });

    return res.json({ message: 'Login exitoso', token });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// 🟢 ME (quién soy)
export const me = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: { perfil: true },
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    return res.json(user);
  } catch {
    return res.status(500).json({ error: 'Error al obtener usuario' });
  }
};