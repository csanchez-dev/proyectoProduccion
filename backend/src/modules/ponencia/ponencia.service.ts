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

export const eliminarPonencia = async (id: string) =>
  supabase.from('ponencia').delete().eq('id', id)

export const actualizarPonencia = async (id: string, data: any) =>
  supabase.from('ponencia').update(data).eq('id', id)