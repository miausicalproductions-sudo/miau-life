import { supabase } from './supabase'
import { areasDeFabrica } from './areasPadrao'
import type { Area, Atividade, Cuidado, EstadoOcorrencia, ItemLista, NovaAtividade, NovoCuidado, Ocorrencia } from './tipos'

// Camada única de dados: com Supabase grava na nuvem; sem Supabase (modo demonstração)
// grava só no aparelho. O resto do app não precisa saber a diferença.

const lsChave = (tabela: string) => `miaulife-demo-${tabela}`

function ler<T>(tabela: string): T[] {
  try {
    const v = localStorage.getItem(lsChave(tabela))
    return v ? (JSON.parse(v) as T[]) : []
  } catch {
    return []
  }
}
function gravar(tabela: string, valor: unknown[]) {
  try {
    localStorage.setItem(lsChave(tabela), JSON.stringify(valor))
  } catch {
    /* sem armazenamento: segue sem salvar */
  }
}
const novoId = () => crypto.randomUUID()
const agora = () => new Date().toISOString()

// ---------- Áreas ----------

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
  let areas = ler<Area>('areas')
  if (areas.length === 0) {
    areas = areasDeFabrica().map((a) => ({ ...a, id: novoId() }))
    gravar('areas', areas)
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
  gravar('areas', ler<Area>('areas').map((x) => (x.id === a.id ? a : x)))
}

export async function criarArea(a: Omit<Area, 'id'>): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('areas').insert(a)
    if (error) throw error
    return
  }
  gravar('areas', [...ler<Area>('areas'), { ...a, id: novoId() }])
}

// ---------- Atividades ----------

const ATIVIDADE_VAZIA: Omit<Atividade, 'id' | 'created_at' | 'titulo' | 'tipo'> = {
  area_id: null,
  descricao: null,
  status: 'pendente',
  prioridade: 'normal',
  inicio: null,
  fim: null,
  dia: null,
  prazo: null,
  meta_semana: null,
  dias_semana: null,
  local: null,
  endereco: null,
  lembrete_min: null,
  concluida_em: null,
  excluida_em: null,
}

/** Traz tudo (inclusive o que está na lixeira, para poder restaurar). */
export async function listarAtividades(): Promise<Atividade[]> {
  if (supabase) {
    const { data, error } = await supabase.from('atividades').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as Atividade[]
  }
  return ler<Atividade>('atividades')
}

export async function criarAtividade(n: NovaAtividade): Promise<void> {
  const linha = { ...ATIVIDADE_VAZIA, ...n }
  if (supabase) {
    const { error } = await supabase.from('atividades').insert(linha)
    if (error) throw error
    return
  }
  gravar('atividades', [{ ...linha, id: novoId(), created_at: agora() }, ...ler<Atividade>('atividades')])
}

export async function atualizarAtividade(id: string, p: Partial<Atividade>): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('atividades').update(p).eq('id', id)
    if (error) throw error
    return
  }
  gravar('atividades', ler<Atividade>('atividades').map((x) => (x.id === id ? { ...x, ...p } : x)))
}

/** Só usado depois de uma confirmação explícita ("Excluir para sempre"). */
export async function excluirDefinitivo(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('atividades').delete().eq('id', id)
    if (error) throw error
    return
  }
  gravar('atividades', ler<Atividade>('atividades').filter((x) => x.id !== id))
  gravar('ocorrencias', ler<Ocorrencia>('ocorrencias').filter((o) => o.atividade_id !== id))
}

// ---------- Ocorrências (metas flexíveis e rotinas, dia a dia) ----------

export async function listarOcorrencias(): Promise<Ocorrencia[]> {
  if (supabase) {
    const { data, error } = await supabase.from('ocorrencias').select('*')
    if (error) throw error
    return (data ?? []) as Ocorrencia[]
  }
  return ler<Ocorrencia>('ocorrencias')
}

export async function definirOcorrencia(atividadeId: string, dia: string, estado: EstadoOcorrencia): Promise<void> {
  if (supabase) {
    if (estado === null) {
      const { error } = await supabase.from('ocorrencias').delete().eq('atividade_id', atividadeId).eq('dia', dia)
      if (error) throw error
      return
    }
    const { error } = await supabase
      .from('ocorrencias')
      .upsert(
        { atividade_id: atividadeId, dia, feito: estado === 'feita', feito_em: estado === 'feita' ? agora() : null },
        { onConflict: 'atividade_id,dia' },
      )
    if (error) throw error
    return
  }
  const resto = ler<Ocorrencia>('ocorrencias').filter((o) => !(o.atividade_id === atividadeId && o.dia === dia))
  if (estado !== null) {
    resto.push({
      id: novoId(),
      atividade_id: atividadeId,
      dia,
      feito: estado === 'feita',
      feito_em: estado === 'feita' ? agora() : null,
      created_at: agora(),
    })
  }
  gravar('ocorrencias', resto)
}

/** "Anotar rápido": guarda na Caixa de entrada para classificar depois. */
export const anotarNaCaixa = (titulo: string) => criarAtividade({ titulo, tipo: 'caixa' })

// ---------- Cuidados (limpeza da casa, autocuidado...) ----------

export async function listarCuidados(): Promise<Cuidado[]> {
  if (supabase) {
    const { data, error } = await supabase.from('cuidados').select('*').order('created_at')
    if (error) throw error
    return (data ?? []) as Cuidado[]
  }
  return ler<Cuidado>('cuidados')
}

export async function criarCuidados(novos: NovoCuidado[]): Promise<void> {
  if (novos.length === 0) return
  const linhas = novos.map((n) => ({ area_id: null, ultima_em: null, anterior_em: null, ativo: true, ...n }))
  if (supabase) {
    const { error } = await supabase.from('cuidados').insert(linhas)
    if (error) throw error
    return
  }
  const criados = linhas.map((l) => ({ ...l, id: novoId(), created_at: agora() }))
  gravar('cuidados', [...ler<Cuidado>('cuidados'), ...criados])
}

export async function atualizarCuidado(id: string, p: Partial<Cuidado>): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('cuidados').update(p).eq('id', id)
    if (error) throw error
    return
  }
  gravar('cuidados', ler<Cuidado>('cuidados').map((x) => (x.id === id ? { ...x, ...p } : x)))
}

/** Só depois de confirmação explícita. */
export async function excluirCuidado(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('cuidados').delete().eq('id', id)
    if (error) throw error
    return
  }
  gravar('cuidados', ler<Cuidado>('cuidados').filter((x) => x.id !== id))
}

// ---------- Lista de compras / reposição ----------

export async function listarItensLista(): Promise<ItemLista[]> {
  if (supabase) {
    const { data, error } = await supabase.from('itens_lista').select('*').order('created_at')
    if (error) throw error
    return (data ?? []) as ItemLista[]
  }
  return ler<ItemLista>('lista')
}

export async function criarItemLista(areaId: string | null, nome: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('itens_lista').insert({ area_id: areaId, nome, feito: false })
    if (error) throw error
    return
  }
  gravar('lista', [...ler<ItemLista>('lista'), { id: novoId(), area_id: areaId, nome, feito: false, created_at: agora() }])
}

export async function atualizarItemLista(id: string, p: Partial<ItemLista>): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('itens_lista').update(p).eq('id', id)
    if (error) throw error
    return
  }
  gravar('lista', ler<ItemLista>('lista').map((x) => (x.id === id ? { ...x, ...p } : x)))
}

export async function excluirItensLista(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  if (supabase) {
    const { error } = await supabase.from('itens_lista').delete().in('id', ids)
    if (error) throw error
    return
  }
  gravar('lista', ler<ItemLista>('lista').filter((x) => !ids.includes(x.id)))
}
