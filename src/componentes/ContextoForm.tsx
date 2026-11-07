import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import FormAtividade, { type OpcoesForm } from './FormAtividade'

interface CtxForm {
  /** Abre o formulário de atividade: novo, ou para editar uma atividade existente. */
  abrirForm: (opcoes?: OpcoesForm) => void
}

const Contexto = createContext<CtxForm | null>(null)

export function ProvedorForm({ children }: { children: ReactNode }) {
  const [opcoes, setOpcoes] = useState<OpcoesForm | null>(null)
  const [versao, setVersao] = useState(0)

  const abrirForm = useCallback((o: OpcoesForm = {}) => {
    setVersao((v) => v + 1) // garante um formulário "limpo" a cada abertura
    setOpcoes(o)
  }, [])
  const valor = useMemo(() => ({ abrirForm }), [abrirForm])

  return (
    <Contexto.Provider value={valor}>
      {children}
      {opcoes && <FormAtividade key={versao} {...opcoes} aoFechar={() => setOpcoes(null)} />}
    </Contexto.Provider>
  )
}

export function useForm() {
  const c = useContext(Contexto)
  if (!c) throw new Error('useForm fora do provedor')
  return c
}
