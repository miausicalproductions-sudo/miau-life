import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import {
  atualizarAtividade, atualizarCuidado, atualizarItemLista, criarAtividade, criarCuidados, criarItemLista,
  definirOcorrencia, excluirCuidado, excluirDefinitivo, excluirItensLista,
  listarAreas, listarAtividades, listarCuidados, listarItensLista, listarOcorrencias,
} from './dados'
import type { Area, Atividade, Cuidado, EstadoOcorrencia, ItemLista, NovaAtividade, NovoCuidado, Ocorrencia } from './tipos'

interface Ctx {
  sessao: Session | null
  carregandoSessao: boolean
  carregando: boolean
  nome: string
  areas: Area[]
  atividades: Atividade[]
  ocorrencias: Ocorrencia[]
  erro: string | null
  recarregar: () => Promise<void>
  criar: (n: NovaAtividade) => Promise<void>
  atualizar: (id: string, p: Partial<Atividade>) => Promise<void>
  excluirParaSempre: (id: string) => Promise<void>
  marcarOcorrencia: (atividadeId: string, dia: string, estado: EstadoOcorrencia) => Promise<void>
  cuidados: Cuidado[]
  itensLista: ItemLista[]
  criarCuidadosEmLote: (novos: NovoCuidado[]) => Promise<void>
  atualizarCuidadoPorId: (id: string, p: Partial<Cuidado>) => Promise<void>
  excluirCuidadoPorId: (id: string) => Promise<void>
  adicionarItemLista: (areaId: string | null, nome: string) => Promise<void>
  atualizarItem: (id: string, p: Partial<ItemLista>) => Promise<void>
  removerItens: (ids: string[]) => Promise<void>
}

const Contexto = createContext<Ctx | null>(null)

export function ProvedorApp({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(null)
  const [carregandoSessao, setCarregandoSessao] = useState(!!supabase)
  const [carregando, setCarregando] = useState(true)
  const [areas, setAreas] = useState<Area[]>([])
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([])
  const [cuidados, setCuidados] = useState<Cuidado[]>([])
  const [itensLista, setItensLista] = useState<ItemLista[]>([])
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      setCarregandoSessao(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_ev, s) => setSessao(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const logado = !supabase || !!sessao

  const recarregar = useCallback(async () => {
    try {
      const [a, t, o] = await Promise.all([listarAreas(), listarAtividades(), listarOcorrencias()])
      setAreas(a)
      setAtividades(t)
      setOcorrencias(o)
      // Etapa 3: se ainda não rodou o etapa3.sql no Supabase, só estas duas telas ficam vazias.
      const [c, l] = await Promise.all([listarCuidados().catch(() => [] as Cuidado[]), listarItensLista().catch(() => [] as ItemLista[])])
      setCuidados(c)
      setItensLista(l)
      setErro(null)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não consegui carregar seus dados.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    if (logado) void recarregar()
  }, [logado, recarregar])

  const criar = useCallback(
    async (n: NovaAtividade) => {
      await criarAtividade(n)
      await recarregar()
    },
    [recarregar],
  )

  // As ações abaixo atualizam a tela na hora (otimista) e salvam em seguida.
  const atualizar = useCallback(
    async (id: string, p: Partial<Atividade>) => {
      setAtividades((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)))
      try {
        await atualizarAtividade(id, p)
      } catch {
        setErro('Não consegui salvar essa mudança. Confira a internet e tente de novo.')
        await recarregar()
      }
    },
    [recarregar],
  )

  const excluirParaSempre = useCallback(
    async (id: string) => {
      setAtividades((prev) => prev.filter((x) => x.id !== id))
      try {
        await excluirDefinitivo(id)
      } catch {
        setErro('Não consegui excluir agora.')
        await recarregar()
      }
    },
    [recarregar],
  )

  const marcarOcorrencia = useCallback(
    async (atividadeId: string, dia: string, estado: EstadoOcorrencia) => {
      setOcorrencias((prev) => {
        const resto = prev.filter((o) => !(o.atividade_id === atividadeId && o.dia === dia))
        if (estado === null) return resto
        const ts = new Date().toISOString()
        return [
          ...resto,
          { id: `tmp-${atividadeId}-${dia}`, atividade_id: atividadeId, dia, feito: estado === 'feita', feito_em: estado === 'feita' ? ts : null, created_at: ts },
        ]
      })
      try {
        await definirOcorrencia(atividadeId, dia, estado)
      } catch {
        setErro('Não consegui salvar essa mudança. Confira a internet e tente de novo.')
        await recarregar()
      }
    },
    [recarregar],
  )

  const criarCuidadosEmLote = useCallback(
    async (novos: NovoCuidado[]) => {
      try {
        await criarCuidados(novos)
      } catch {
        setErro('Não consegui salvar. Você já rodou o etapa3.sql no Supabase?')
      }
      await recarregar()
    },
    [recarregar],
  )

  const atualizarCuidadoPorId = useCallback(
    async (id: string, p: Partial<Cuidado>) => {
      setCuidados((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)))
      try {
        await atualizarCuidado(id, p)
      } catch {
        setErro('Não consegui salvar essa mudança. Confira a internet e tente de novo.')
        await recarregar()
      }
    },
    [recarregar],
  )

  const excluirCuidadoPorId = useCallback(
    async (id: string) => {
      setCuidados((prev) => prev.filter((x) => x.id !== id))
      try {
        await excluirCuidado(id)
      } catch {
        setErro('Não consegui excluir agora.')
        await recarregar()
      }
    },
    [recarregar],
  )

  const adicionarItemLista = useCallback(
    async (areaId: string | null, nomeItem: string) => {
      try {
        await criarItemLista(areaId, nomeItem)
      } catch {
        setErro('Não consegui salvar. Você já rodou o etapa3.sql no Supabase?')
      }
      await recarregar()
    },
    [recarregar],
  )

  const atualizarItem = useCallback(
    async (id: string, p: Partial<ItemLista>) => {
      setItensLista((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)))
      try {
        await atualizarItemLista(id, p)
      } catch {
        setErro('Não consegui salvar essa mudança. Confira a internet e tente de novo.')
        await recarregar()
      }
    },
    [recarregar],
  )

  const removerItens = useCallback(
    async (ids: string[]) => {
      setItensLista((prev) => prev.filter((x) => !ids.includes(x.id)))
      try {
        await excluirItensLista(ids)
      } catch {
        setErro('Não consegui excluir agora.')
        await recarregar()
      }
    },
    [recarregar],
  )

  const nome = (sessao?.user.user_metadata?.nome as string | undefined) || localStorage.getItem('miaulife-nome') || 'Thaís'

  const valor = useMemo(
    () => ({ sessao, carregandoSessao, carregando, nome, areas, atividades, ocorrencias, erro, recarregar, criar, atualizar, excluirParaSempre, marcarOcorrencia, cuidados, itensLista, criarCuidadosEmLote, atualizarCuidadoPorId, excluirCuidadoPorId, adicionarItemLista, atualizarItem, removerItens }),
    [sessao, carregandoSessao, carregando, nome, areas, atividades, ocorrencias, erro, recarregar, criar, atualizar, excluirParaSempre, marcarOcorrencia, cuidados, itensLista, criarCuidadosEmLote, atualizarCuidadoPorId, excluirCuidadoPorId, adicionarItemLista, atualizarItem, removerItens],
  )
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useApp() {
  const c = useContext(Contexto)
  if (!c) throw new Error('useApp fora do provedor')
  return c
}
