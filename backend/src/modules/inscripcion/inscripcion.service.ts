import { supabase } from '../../config/supabase'

export const crearInscripcion = async (
  usuario_id: string,
  ponencia_id: string
) => {
  return await supabase
    .from('inscripcion_ponencia')
    .insert({
      usuario_id,
      ponencia_id
    })
}