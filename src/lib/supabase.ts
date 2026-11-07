import { createClient } from '@supabase/supabase-js'

// Estas duas informações são PÚBLICAS por natureza (a segurança dos dados é feita
// pelo login e pelas regras do banco). Nunca coloque aqui a chave "service_role".
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = url && key ? createClient(url, key) : null

/** Sem Supabase configurado o app abre em "modo demonstração" (dados só neste aparelho). */
export const modoDemo = !supabase
