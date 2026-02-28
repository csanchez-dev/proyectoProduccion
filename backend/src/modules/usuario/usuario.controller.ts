import { Request, Response } from 'express'
import * as service from './usuario.service'
import { admin_supabase} from '../../config/supabase'


// Registrar un usuario(CREATE)

export const registerUser = async (req: Request, res: Response) => {
  const {nombres, apellidos, universidad, email, password } = req.body

  //Crear usuario en auth supabase
  const { data, error } = await admin_supabase.auth.signUp({
    email,
    password
  })

  if (error || !data.user) {
    return res.status(400).json({ error: error?.message })
  }

  //Crear perfil con el id que retorna supabase

  const { error: profileError } = await admin_supabase
  .from('perfil_usuario')
    .insert({
      id: data.user.id,
      nombres,
      apellidos,
      universidad
    })

    if (profileError) {
      return res.status(400).json({ error: profileError.message })
    }

    return res.status(201).json({
      message: "Usuario y perfil creados correctamente"
    })
}

export const obtenerPerfil = async (req: Request, res: Response) => {
  const userId = (req as any).user.id
  const { data, error } = await service.obtenerMiPerfil(userId)

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}
