import { supabase } from '../../config/supabase'

export const obtenerPonentes = async () =>
    supabase.from('ponente').select('*')

export const crearPonente = async (data: any) =>
    supabase.from('ponente').insert(data).select().single()
