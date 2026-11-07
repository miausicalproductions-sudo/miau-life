import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../lib/ContextoApp'
import { CaixaMarca } from './ItemCartao'
import type { Area } from '../lib/tipos'

/** Lista de compras e reposição da casa (o que falta comprar). */
export default function ListaCompras({ area }: { area: Area }) {
  const { itensLista, adicionarItemLista, atualizarItem, removerItens } = useApp()
  const [texto, setTexto] = useState('')
  const meus = itensLista.filter((i) => i.area_id === area.id)
  const pendentes = meus.filter((i) => !i.feito)
  const comprados = meus.filter((i) => i.feito)

  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    const nome = texto.trim()
    if (!nome) return
    setTexto('')
    await adicionarItemLista(area.id, nome)
  }

  function limpar() {
    if (!confirm(`Tirar ${comprados.length} ${comprados.length === 1 ? 'item comprado' : 'itens comprados'} da lista?`)) return
    void removerItens(comprados.map((i) => i.id))
  }

  return (
    <section className="cartao flex flex-col gap-3 p-4" aria-label="Lista de compras">
      <h2 className="m-0 text-lg font-semibold text-titulo">Lista de compras</h2>
      <form onSubmit={adicionar} className="flex gap-2">
        <input className="campo flex-1" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ex.: Detergente, esponja…" aria-label="Novo item da lista" />
        <button className="btn !min-h-12 !px-4" aria-label="Adicionar item" disabled={!texto.trim()}>
          <Plus size={20} />
        </button>
      </form>

      {meus.length === 0 ? (
        <p className="m-0 text-sm text-suave">Anote aqui o que acabou ou está acabando.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {[...pendentes, ...comprados].map((i) => (
            <li key={i.id} className="flex items-center gap-3">
              <CaixaMarca ligada={i.feito} aoClicar={() => void atualizarItem(i.id, { feito: !i.feito })} rotulo={i.feito ? `Desmarcar ${i.nome}` : `Marcar ${i.nome} como comprado`} />
              <span className={`font-bold ${i.feito ? 'line-through opacity-60' : ''}`}>{i.nome}</span>
            </li>
          ))}
        </ul>
      )}
      {comprados.length > 0 && (
        <button className="self-start border-0 bg-transparent p-0 text-sm font-bold text-titulo" onClick={limpar}>
          Limpar comprados ({comprados.length})
        </button>
      )}
    </section>
  )
}
