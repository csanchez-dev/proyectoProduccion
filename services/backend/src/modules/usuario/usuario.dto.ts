import { z } from 'zod'

export const registerUserSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es obligatorio"),
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.enum(['ESTUDIANTE', 'DOCENTE', 'ADMIN', 'USER']).default('USER'),
  career: z.string().optional(),
  gender: z.string().optional(),
  documentNumber: z.string().optional(),
  institutionalCode: z.string().optional(),
})

export const loginUserSchema = z.object({
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
})

export const crearPerfilSchema = z.object({
  nombre_completo: z.string().min(1, "El nombre completo es obligatorio"),
  rol: z.enum(['ESTUDIANTE', 'DOCENTE', 'ADMIN', 'USER']).default('USER'),
})

export const actualizarPerfilSchema = z.object({
  nombre_completo: z.string().min(1, "El nombre completo es obligatorio").optional(),
  carrera: z.string().optional(),
})