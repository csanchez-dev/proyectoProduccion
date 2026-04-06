// src/controllers/usuario.controller.ts
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../config/prisma'

// 🟢 Registro (usuario + perfil)
export const registerUser = async (req: Request, res: Response) => {
  const { email, password, nombres, apellidos, universidad, tipo_usuario } = req.body

  try {
    // Verificar email único
    const exists = await prisma.usuario.findUnique({
      where: { email }
    })

    if (exists) {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Transacción (usuario + perfil)
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.usuario.create({
        data: {
          email,
          password_hash: hashedPassword
        }
      })

      await tx.perfilUsuario.create({
        data: {
          id: newUser.id,
          nombres,
          apellidos,
          universidad,
          tipo_usuario
        }
      })

      return newUser
    })

    return res.status(201).json({
      message: 'Usuario creado correctamente',
      userId: user.id
    })

  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// 🔵 Obtener mi perfil
export const getMyProfile = async (req: any, res: Response) => {
  const userId = req.user.userId

  try {
    const perfil = await prisma.perfilUsuario.findUnique({
      where: { id: userId }
    })

    return res.json(perfil)
  } catch {
    return res.status(500).json({ error: 'Error al obtener perfil' })
  }
}

// 🟡 Actualizar perfil
export const updateProfile = async (req: any, res: Response) => {
  const userId = req.user.userId
  const { nombres, apellidos, universidad } = req.body

  try {
    const updated = await prisma.perfilUsuario.update({
      where: { id: userId },
      data: {
        nombres,
        apellidos,
        universidad
      }
    })

    res.json({
      message: 'Perfil actualizado',
      data: updated
    })
  } catch {
    res.status(400).json({ error: 'No se pudo actualizar' })
  }
}

// 🔴 Obtener todos los usuarios (admin)
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.usuario.findMany({
      include: {
        perfil: true
      }
    })

    res.json(users)
  } catch {
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
}