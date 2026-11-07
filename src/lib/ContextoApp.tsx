import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { listarAreas, listarPendentes } from './dados'
import type { Area, Atividade } from './tipos'

interface Ctx {
  sessao: Session | null
  carregandoSessao: boolean
  nome: string
  areas: Area[]
  pendentes: Atividade[]
  erro: string | null
  recarregar: () => Promise<void>
}

const Contexto = createContext<Ctx | null>(null)

export function ProvedorApp({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(null)
  const [carregandoSessao, setCarregandoSessao] = useState(!!supabase)
  const [areas, setAreas] = useState<Area[]>([])
  const [pendentes, setPendentes] = useState<Atividade[]>([])
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
      const [a, p] = await Promise.all([listarAreas(), listarPendentes()])
      setAreas(a)
      setPendentes(p)
      setErro(null)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não consegui carregar seus dados.')
    }
  }, [])

  useEffect(() => {
    if (logado) void recarregar()
  }, [logado, recarregar])

  const nome = (sessao?.user.user_metadata?.nome as string | undefined) || localStorage.getItem('miaulife-nome') || 'Thaís'

  const valor = useMemo(
    () => ({ sessao, carregandoSessao, nome, areas, pendentes, erro, recarregar }),
    [sessao, carregandoSessao, nome, areas, pendentes, erro, recarregar],
  )
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useApp() {
  const c = useContext(Contexto)
  if (!c) throw new Error('useApp fora do provedor')
  return c
}
