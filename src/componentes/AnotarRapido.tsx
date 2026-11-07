import { useState } from 'react'
import { anotarNaCaixa } from '../lib/dados'
import { useApp } from '../lib/ContextoApp'

export default function AnotarRapido({ aoFechar }: { aoFechar: () => void }) {
  const [texto, setTexto] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const { recarregar } = useApp()

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    const t = texto.trim()
    if (!t) return
    setSalvando(true)
    try {
      await anotarNaCaixa(t)
      await recarregar()
      aoFechar()
    } catch {
      setMsg('Não consegui salvar agora. Tente de novo.')
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 md:items-center" onClick={aoFechar}>
      <form
        onSubmit={salvar}
        onClick={(e) => e.stopPropagation()}
        className="folha cartao barra-baixo w-full max-w-md rounded-b-none p-5 md:rounded-b-3xl"
      >
        <div className="mb-1 text-lg font-extrabold">🐾 Anotar rápido</div>
        <p className="mb-3 text-sm text-suave">Vai para a sua Caixa de entrada. Depois você escolhe a área e o dia.</p>
        <input
          autoFocus
          className="campo"
          placeholder="O que você quer lembrar?"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        {msg && <p className="mt-2 text-sm text-destaque">{msg}</p>}
        <div className="mt-4 flex gap-3">
          <button type="button" className="btn btn-suave" onClick={aoFechar}>
            Cancelar
          </button>
          <button className="btn flex-1" disabled={salvando || !texto.trim()}>
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}
