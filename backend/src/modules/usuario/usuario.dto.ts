import { z } from 'zod'

export const crearPerfilSchema = z.object({
  nombres: z.string(),
  apellidos: z.string(),
  universidad: z.string().optional()
})