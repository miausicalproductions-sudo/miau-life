import { supabase } from './supabase'
import { areasDeFabrica } from './areasPadrao'
import type { Area, Atividade } from './tipos'

// Camada única de dados: com Supabase grava na nuvem; sem Supabase (modo demonstração)
// grava só no aparelho. O resto do app não precisa saber a diferença.

const LS_AREAS = 'miaulife-demo-areas'
const LS_ATIV = 'miaulife-demo-atividades'

function ler<T>(chave: string, padrao: T): T {
  try {
    const v = localStorage.getItem(chave)
    return v ? (JSON.parse(v) as T) : padrao
  } catch {
    return padrao
  }
}
function gravar(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    /* sem armazenamento: segue sem salvar */
  }
}
const novoId = () => crypto.randomUUID()

export async function listarAreas(): Promise<Area[]> {
  if (supabase) {
    const { data, error } = await supabase.from('areas').select('*').order('posicao')
    if (error) throw error
    if (data && data.length > 0) return data as Area[]
    // primeiro acesso: cria as áreas de fábrica (que você pode renomear, recolorir, arquivar...)
    const { error: e2 } = await supabase.from('areas').insert(areasDeFabrica())
    if (e2) throw e2
    const { data: d2, error: e3 } = await supabase.from('areas').select('*').order('posicao')
    if (e3) throw e3
    return (d2 ?? []) as Area[]
  }
  let areas = ler<Area[]>(LS_AREAS, [])
  if (areas.length === 0) {
    areas = areasDeFabrica().map((a) => ({ ...a, id: novoId() }))
    gravar(LS_AREAS, areas)
  }
  return areas
}

export async function salvarArea(a: Area): Promise<void> {
  if (supabase) {
    const { error } = await supabase
      .from('areas')
      .update({ nome: a.nome, icone: a.icone, cor: a.cor, posicao: a.posicao, arquivada: a.arquivada })
      .eq('id', a.id)
    if (error) throw error
    return
  }
  gravar(LS_AREAS, ler<Area[]>(LS_AREAS, []).map((x) => (x.id === a.id ? a : x)))
}

export async function criarArea(a: Omit<Area, 'id'>): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('areas').insert(a)
    if (error) throw error
    return
  }
  gravar(LS_AREAS, [...ler<Area[]>(LS_AREAS, []), { ...a, id: novoId() }])
}

/** Atividades que ainda estão pendentes (a lixeira/arquivo ficam de fora). */
export async function listarPendentes(): Promise<Atividade[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('atividades')
      .select('id,area_id,titulo,tipo,status,dia,prazo,inicio,created_at')
      .eq('status', 'pendente')
      .is('excluida_em', null)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as Atividade[]
  }
  return ler<Atividade[]>(LS_ATIV, []).filter((x) => x.status === 'pendente')
}

/** "Anotar rápido": guarda na Caixa de entrada para classificar depois. */
export async function anotarNaCaixa(titulo: string): Promise<void> {
  const base = { titulo, tipo: 'caixa' as const, status: 'pendente' as const, area_id: null, dia: null, prazo: null, inicio: null }
  if (supabase) {
    const { error } = await supabase.from('atividades').insert(base)
    if (error) throw error
    return
  }
  gravar(LS_ATIV, [{ ...base, id: novoId(), created_at: new Date().toISOString() }, ...ler<Atividade[]>(LS_ATIV, [])])
}
