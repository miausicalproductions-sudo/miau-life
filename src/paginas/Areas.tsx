import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../lib/ContextoApp'
import { criarArea, salvarArea } from '../lib/dados'
import { CORES, ICONES } from '../lib/areasPadrao'
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
      await salvarArea({ ...a, posicao: b.posicao })
      await salvarArea({ ...b, posicao: a.posicao })
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
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="m-0 text-3xl font-extrabold">Áreas</h1>
        <button className="btn" onClick={() => setEdicao({ modo: 'nova' })}>＋ Nova área</button>
      </div>
      <p className="m-0 text-suave">Mude nome, cor, ícone e ordem do jeito que combinar com a sua vida.</p>
      {erro && <p className="rounded-2xl bg-pessego/60 px-4 py-3 text-sm">{erro}</p>}

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {ativas.map((a, i) => (
          <li key={a.id} className={`cartao-area cor-${a.cor} flex items-center gap-3 p-3 pr-2`}>
            <Link to={`/area/${a.id}`} className="flex flex-1 items-center gap-3 no-underline" style={{ color: 'inherit' }}>
              <span className="bolinha grid h-12 w-12 place-items-center rounded-2xl text-2xl">{a.icone}</span>
              <span className="font-extrabold">{a.nome}</span>
            </Link>
            <button aria-label="Subir" disabled={i === 0} onClick={() => mover(i, -1)} className="h-10 w-9 disabled:opacity-25">↑</button>
            <button aria-label="Descer" disabled={i === ativas.length - 1} onClick={() => mover(i, 1)} className="h-10 w-9 disabled:opacity-25">↓</button>
            <button aria-label={`Editar ${a.nome}`} onClick={() => setEdicao({ modo: 'editar', area: a })} className="h-10 w-10 text-lg">✏️</button>
          </li>
        ))}
      </ul>

      {arquivadas.length > 0 && (
        <div>
          <button className="text-sm font-bold text-suave" onClick={() => setVerArquivadas(!verArquivadas)}>
            {verArquivadas ? 'Esconder' : 'Mostrar'} arquivadas ({arquivadas.length})
          </button>
          {verArquivadas && (
            <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
              {arquivadas.map((a) => (
                <li key={a.id} className="cartao flex items-center gap-3 p-3 opacity-80">
                  <span className="text-2xl">{a.icone}</span>
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
  const [icone, setIcone] = useState(existente?.icone ?? '🎀')
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
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30 md:items-center" onClick={aoFechar}>
      <form onSubmit={salvar} onClick={(e) => e.stopPropagation()} className="folha cartao barra-baixo max-h-[92vh] w-full max-w-md overflow-y-auto rounded-b-none p-5 md:rounded-b-3xl">
        <div className="mb-4 text-lg font-extrabold">{existente ? 'Editar área' : 'Nova área'}</div>

        <label className="rotulo" htmlFor="nome-area">Nome</label>
        <input id="nome-area" className="campo mb-4" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Artesanato" autoFocus />

        <span className="rotulo">Ícone</span>
        <div className="mb-4 grid grid-cols-8 gap-1">
          {ICONES.map((i) => (
            <button type="button" key={i} onClick={() => setIcone(i)} className={`h-10 rounded-xl text-xl ${icone === i ? 'bg-rosa/60 ring-2 ring-destaque' : ''}`}>{i}</button>
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
              className={`cor-${c.id} h-10 w-10 rounded-full ${cor === c.id ? 'ring-2 ring-destaque ring-offset-2' : ''}`}
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
          <button type="button" className="mt-4 w-full text-sm font-bold text-suave" onClick={() => aoArquivar(existente)}>
            Arquivar esta área
          </button>
        )}
      </form>
    </div>
  )
}
