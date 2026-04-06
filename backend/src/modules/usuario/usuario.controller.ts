import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export const registerUser = async (req: Request, res: Response) => {
  const { fullName, email, password, rol, career, gender, documentNumber, institutionalCode } = req.body

  try {
    // Validaciones únicas
    if (documentNumber) {
      const docExists = await prisma.usuario.findUnique({
        where: { documento: documentNumber }
      })
      if (docExists) {
        return res.status(400).json({ error: "Documento ya registrado" })
      }
    }

    if (institutionalCode) {
      const codeExists = await prisma.usuario.findUnique({
        where: { codigoInstitucional: institutionalCode }
      })
      if (codeExists) {
        return res.status(400).json({ error: "Código institucional ya registrado" })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const user = await prisma.usuario.create({
      data: {
        nombreCompleto: fullName,
        email,
        password: hashedPassword,
        rol,
        carrera: career,
        genero: gender,
        documento: documentNumber,
        codigoInstitucional: institutionalCode
      }
    })

    // Crear token
    const token = jwt.sign(
      { userId: user.id, rol: user.rol },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )

    return res.status(201).json({
      message: "Usuario creado correctamente",
      token
    })

  } catch (err) {
    return res.status(500).json({ error: "Error interno" })
  }
}

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body

  const user = await prisma.usuario.findUnique({ where: { email } })

  if (!user) {
    return res.status(400).json({ error: "Usuario no encontrado" })
  }

  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
    return res.status(400).json({ error: "Contraseña incorrecta" })
  }

  const token = jwt.sign(
    { userId: user.id, rol: user.rol },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  )

  res.json({ token })
}