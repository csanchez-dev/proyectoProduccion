import { supabase } from '../../config/supabase'

export const obtenerPonencias = async () =>
  supabase.from('ponencia').select(`
    *,
    sala(*),
    dia_evento(*),
    ponencia_ponente(
      ponente(*)
    )
  `)

export const crearPonencia = async (data: any) =>
  supabase.from('ponencia').insert(data)