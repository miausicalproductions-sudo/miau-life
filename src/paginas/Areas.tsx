import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, Pencil, Plus, Settings } from 'lucide-react'
import { useApp } from '../lib/ContextoApp'
import { criarArea, salvarArea } from '../lib/dados'
import { CORES } from '../lib/areasPadrao'
import { Icone, NOMES_ICONES, nomeIconeArea } from '../lib/icones'
import Folha from '../componentes/Folha'
import type { Area, CorNome } from '../lib/tipos'

type Edicao = { modo: 'nova' } | { modo: 'editar'; area: Area }

export default function Areas() {
  const { areas, recarregar } = useApp()
  const [edicao, setEdicao] = useState<Edicao | null>(null)
  const [verArquivadas, setVerArquivadas] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const ativas = areas.filter((a) => !a.arquivada).sort((a, b) => a.posicao - b.posicao)
  const arquivadas = areas.filter((a) => a.arquivada)

  async function mover(i: number, delta: -1 | 1) {
    const a = ativas[i]
    const b = ativas[i + delta]
    if (!a || !b) return
    try {
      // troca as posições; se estiverem iguais, usa a ordem da lista
      const pa = delta === -1 ? i - 1 : i + 1
      const pb = i
      await salvarArea({ ...a, posicao: pa })
      await salvarArea({ ...b, posicao: pb })
      await recarregar()
    } catch {
      setErro('Não consegui mudar a ordem agora.')
    }
  }

  async function arquivar(a: Area, arquivada: boolean) {
    if (arquivada && !confirm(`Arquivar “${a.nome}”? Nada é apagado: você pode restaurar quando quiser.`)) return
    try {
      await salvarArea({ ...a, arquivada })
      await recarregar()
    } catch {
      setErro('Não consegui salvar agora.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="m-0 text-2xl font-semibold text-titulo">Áreas</h1>
        <div className="flex items-center gap-2">
          <button className="btn !min-h-11" onClick={() => setEdicao({ modo: 'nova' })}><Plus size={18} /> Nova área</button>
          <Link to="/ajustes" aria-label="Ajustes" className="cartao grid h-11 w-11 place-items-center !rounded-full" style={{ color: 'inherit' }}>
            <Settings size={20} />
          </Link>
        </div>
      </div>
      <p className="m-0 text-sm text-suave">Mude nome, cor, ícone e ordem do jeito que combinar com a sua vida. As primeiras seis aparecem grandes no Início.</p>
      {erro && <p className="m-0 rounded-2xl bg-pessego/60 px-4 py-3 text-sm">{erro}</p>}

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {ativas.map((a, i) => (
          <li key={a.id} className={`cartao-area cor-${a.cor} flex items-center gap-2 p-3 pr-2`}>
            <Link to={`/area/${a.id}`} className="flex flex-1 items-center gap-3 no-underline" style={{ color: 'inherit' }}>
              <span className="bolinha icone-forte grid h-12 w-12 place-items-center rounded-2xl"><Icone nome={nomeIconeArea(a)} size={26} /></span>
              <span className="font-display text-lg font-semibold">{a.nome}</span>
            </Link>
            <button aria-label={`Subir ${a.nome}`} disabled={i === 0} onClick={() => mover(i, -1)} className="grid h-10 w-9 place-items-center border-0 bg-transparent disabled:opacity-25"><ArrowUp size={18} /></button>
            <button aria-label={`Descer ${a.nome}`} disabled={i === ativas.length - 1} onClick={() => mover(i, 1)} className="grid h-10 w-9 place-items-center border-0 bg-transparent disabled:opacity-25"><ArrowDown size={18} /></button>
            <button aria-label={`Editar ${a.nome}`} onClick={() => setEdicao({ modo: 'editar', area: a })} className="grid h-10 w-10 place-items-center border-0 bg-transparent"><Pencil size={19} /></button>
          </li>
        ))}
      </ul>

      {arquivadas.length > 0 && (
        <div>
          <button className="border-0 bg-transparent p-0 text-sm font-bold text-suave" onClick={() => setVerArquivadas(!verArquivadas)}>
            {verArquivadas ? 'Esconder' : 'Mostrar'} arquivadas ({arquivadas.length})
          </button>
          {verArquivadas && (
            <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
              {arquivadas.map((a) => (
                <li key={a.id} className="cartao flex items-center gap-3 p-3 opacity-80">
                  <Icone nome={nomeIconeArea(a)} size={24} />
                  <span className="flex-1 font-bold">{a.nome}</span>
                  <button className="btn btn-suave !min-h-10 !px-4 text-sm" onClick={() => arquivar(a, false)}>Restaurar</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {edicao && (
        <Editor
          edicao={edicao}
          proximaPosicao={areas.length}
          aoFechar={() => setEdicao(null)}
          aoSalvar={async () => { setEdicao(null); await recarregar() }}
          aoArquivar={(a) => { setEdicao(null); void arquivar(a, true) }}
        />
      )}
    </div>
  )
}

function Editor({
  edicao, proximaPosicao, aoFechar, aoSalvar, aoArquivar,
}: {
  edicao: Edicao
  proximaPosicao: number
  aoFechar: () => void
  aoSalvar: () => Promise<void>
  aoArquivar: (a: Area) => void
}) {
  const existente = edicao.modo === 'editar' ? edicao.area : null
  const [nome, setNome] = useState(existente?.nome ?? '')
  const [icone, setIcone] = useState(existente ? nomeIconeArea(existente) : 'star')
  const [cor, setCor] = useState<CorNome>(existente?.cor ?? 'rosa')
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return
    setSalvando(true)
    try {
      if (existente) await salvarArea({ ...existente, nome: nome.trim(), icone, cor })
      else await criarArea({ chave: 'personalizada', nome: nome.trim(), icone, cor, posicao: proximaPosicao, arquivada: false })
      await aoSalvar()
    } catch {
      setErro('Não consegui salvar agora. Tente de novo.')
      setSalvando(false)
    }
  }

  return (
    <Folha titulo={existente ? 'Editar área' : 'Nova área'} aoFechar={aoFechar}>
      <form onSubmit={salvar}>
        <label className="rotulo" htmlFor="nome-area">Nome</label>
        <input id="nome-area" className="campo mb-4" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Artesanato" autoFocus />

        <span className="rotulo">Ícone</span>
        <div className="mb-4 grid grid-cols-8 gap-1">
          {NOMES_ICONES.map((i) => (
            <button type="button" key={i} aria-label={i} aria-pressed={icone === i} onClick={() => setIcone(i)} className={`grid h-10 place-items-center rounded-xl border-0 ${icone === i ? 'bg-rosa/60 ring-2 ring-destaque' : 'bg-transparent'}`}>
              <Icone nome={i} size={22} />
            </button>
          ))}
        </div>

        <span className="rotulo">Cor</span>
        <div className="mb-5 flex flex-wrap gap-3">
          {CORES.map((c) => (
            <button
              type="button"
              key={c.id}
              aria-label={c.nome}
              aria-pressed={cor === c.id}
              onClick={() => setCor(c.id)}
              className={`cor-${c.id} h-10 w-10 rounded-full border-0 ${cor === c.id ? 'ring-2 ring-destaque ring-offset-2' : ''}`}
              style={{ background: 'var(--cor)' }}
            />
          ))}
        </div>

        {erro && <p className="mb-3 text-sm text-destaque">{erro}</p>}
        <div className="flex gap-3">
          <button type="button" className="btn btn-suave" onClick={aoFechar}>Cancelar</button>
          <button className="btn flex-1" disabled={salvando || !nome.trim()}>Salvar</button>
        </div>
        {existente && (
          <button type="button" className="mt-4 w-full border-0 bg-transparent text-sm font-bold text-suave" onClick={() => aoArquivar(existente)}>
            Arquivar esta área
          </button>
        )}
      </form>
    </Folha>
  )
}
