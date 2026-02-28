import { z } from 'zod'

export const crearPerfilSchema = z.object({
  nombres: z.string().min(1, "El nombre es obligatorio"),
  apellidos: z.string().min(1, "El nombre es obligatorio"),
  universidad: z.string().min(1).optional()
})