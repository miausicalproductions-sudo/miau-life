import { useEffect, useMemo, useState } from 'react'
import { Plus, Sparkles, Undo2 } from 'lucide-react'
import { useApp } from '../lib/ContextoApp'
import { CaixaMarca } from './ItemCartao'
import Folha from './Folha'
import { ordenar, situacao, textoFrequencia, textoSituacao } from '../lib/cuidados'
import { hojeISO } from '../lib/datas'
import type { ConfigCuidados } from '../lib/sugestoes'
import type { Area, Cuidado } from '../lib/tipos'

const FREQUENCIAS = [
  { dias: 1, nome: 'Todo dia' },
  { dias: 3, nome: '3 dias' },
  { dias: 7, nome: 'Semanal' },
  { dias: 14, nome: '2 semanas' },
  { dias: 30, nome: 'Mensal' },
  { dias: 90, nome: '3 meses' },
]

/** Lista de cuidados que se repetem (cômodos da casa, skincare, cabelo...), com aviso do que está na hora. */
export default function Cuidados({ area, config }: { area: Area; config: ConfigCuidados }) {
  const { cuidados, criarCuidadosEmLote, atualizarCuidadoPorId } = useApp()
  const hoje = hojeISO()
  const [grupo, setGrupo] = useState<string>('todos')
  const [editando, setEditando] = useState<Cuidado | 'novo' | null>(null)
  const [desfazer, setDesfazer] = useState<Cuidado | null>(null)
  const [mostrarEmDia, setMostrarEmDia] = useState(false)

  const meus = useMemo(() => cuidados.filter((c) => c.area_id === area.id && c.ativo), [cuidados, area.id])
  const grupos = useMemo(() => {
    const usados = new Set(meus.map((c) => c.grupo))
    const ordem = [...config.grupos.filter((g) => usados.has(g)), ...[...usados].filter((g) => !config.grupos.includes(g)).sort()]
    return ordem
  }, [meus, config.grupos])

  // se o grupo escolhido ficou sem itens, volta para "Todos"
  useEffect(() => {
    if (grupo !== 'todos' && !grupos.includes(grupo)) setGrupo('todos')
  }, [grupo, grupos])

  useEffect(() => {
    if (!desfazer) return
    const t = setTimeout(() => setDesfazer(null), 7000)
    return () => clearTimeout(t)
  }, [desfazer])

  const visiveis = ordenar(grupo === 'todos' ? meus : meus.filter((c) => c.grupo === grupo), hoje)
  const paraFazer = visiveis.filter((c) => situacao(c, hoje).estado !== 'em-dia')
  const emDia = visiveis.filter((c) => situacao(c, hoje).estado === 'em-dia')

  const faltantes = config.sugestoes.filter((s) => !meus.some((c) => c.nome === s.nome && c.grupo === s.grupo))

  function alternarFeito(c: Cuidado) {
    if (c.ultima_em === hoje) {
      void atualizarCuidadoPorId(c.id, { ultima_em: c.anterior_em, anterior_em: null })
      setDesfazer(null)
    } else {
      void atualizarCuidadoPorId(c.id, { ultima_em: hoje, anterior_em: c.ultima_em })
      setDesfazer(c)
    }
  }

  function desfazerUltimo() {
    if (!desfazer) return
    void atualizarCuidadoPorId(desfazer.id, { ultima_em: desfazer.ultima_em, anterior_em: desfazer.anterior_em })
    setDesfazer(null)
  }

  function Linha({ c }: { c: Cuidado }) {
    const s = situacao(c, hoje)
    const feitoHoje = c.ultima_em === hoje
    const urgente = s.estado === 'atrasado' || s.estado === 'hoje'
    return (
      <li className="cartao flex items-center gap-3 p-3">
        <CaixaMarca ligada={feitoHoje} aoClicar={() => alternarFeito(c)} rotulo={feitoHoje ? `Desfazer ${c.nome}` : `Marcar ${c.nome} como feito hoje`} />
        <button type="button" onClick={() => setEditando(c)} className="min-w-0 flex-1 border-0 bg-transparent p-0 text-left" aria-label={`Editar ${c.nome}`}>
          <span className={`block font-extrabold leading-tight ${feitoHoje ? 'line-through opacity-60' : ''}`}>{c.nome}</span>
          <span className="mt-0.5 block text-xs text-suave">
            {c.grupo} · {textoFrequencia(c.frequencia_dias)}
          </span>
        </button>
        <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-extrabold ${urgente ? 'bg-destaque text-white' : s.estado === 'nunca' ? 'bg-pessego/60' : 'bg-black/5 text-suave'}`}>
          {feitoHoje ? 'Feito hoje' : textoSituacao(s)}
        </span>
      </li>
    )
  }

  return (
    <section className="flex flex-col gap-3" aria-label={config.titulo}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="m-0 text-lg font-semibold text-titulo">{config.titulo}</h2>
        <button className="btn btn-suave !min-h-10 !px-4 text-sm" onClick={() => setEditando('novo')}>
          <Plus size={17} /> Novo
        </button>
      </div>

      {meus.length === 0 ? (
        <div className="cartao flex flex-col items-center gap-3 p-6 text-center">
          <Sparkles className="text-titulo" />
          <p className="m-0 text-sm text-suave">{config.vazio}</p>
          <button className="btn" onClick={() => void criarCuidadosEmLote(config.sugestoes.map((s) => ({ ...s, area_id: area.id })))}>
            Começar com sugestões
          </button>
          <p className="m-0 text-xs text-suave">Você poderá mudar, tirar ou acrescentar o que quiser depois.</p>
        </div>
      ) : (
        <>
          {grupos.length > 1 && (
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Filtrar por grupo">
              {['todos', ...grupos].map((g) => (
                <button
                  key={g}
                  role="tab"
                  aria-selected={grupo === g}
                  onClick={() => setGrupo(g)}
                  className={`shrink-0 whitespace-nowrap rounded-full border-2 px-4 py-1.5 text-sm font-bold ${grupo === g ? 'border-transparent bg-destaque text-white' : 'border-borda bg-cartao'}`}
                >
                  {g === 'todos' ? 'Todos' : g}
                </button>
              ))}
            </div>
          )}

          {paraFazer.length > 0 ? (
            <>
              <h3 className="m-0 mt-1 text-sm font-extrabold uppercase tracking-wide text-suave">Na hora de fazer ({paraFazer.length})</h3>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {paraFazer.map((c) => <Linha key={c.id} c={c} />)}
              </ul>
            </>
          ) : (
            <p className="cartao m-0 p-4 text-center text-sm text-suave">Tudo em dia por aqui. Que capricho!</p>
          )}

          {emDia.length > 0 && (
            <>
              <button
                className="mt-1 flex items-center gap-1 self-start border-0 bg-transparent p-0 text-sm font-extrabold uppercase tracking-wide text-suave"
                aria-expanded={mostrarEmDia}
                onClick={() => setMostrarEmDia(!mostrarEmDia)}
              >
                {mostrarEmDia ? 'Esconder' : 'Mostrar'} em dia ({emDia.length})
              </button>
              {mostrarEmDia && (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {emDia.map((c) => <Linha key={c.id} c={c} />)}
                </ul>
              )}
            </>
          )}

          {faltantes.length > 0 && (
            <button
              className="self-start border-0 bg-transparent p-0 text-sm font-bold text-titulo"
              onClick={() => void criarCuidadosEmLote(faltantes.map((s) => ({ ...s, area_id: area.id })))}
            >
              + Adicionar as {faltantes.length} sugestões que faltam
            </button>
          )}
        </>
      )}

      {desfazer && (
        <div role="status" className="fixed inset-x-4 bottom-24 z-30 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-2xl bg-[#3b2f45] px-4 py-3 text-sm font-bold text-white shadow-lg">
          <span>“{desfazer.nome}” feito!</span>
          <button className="flex items-center gap-1 border-0 bg-transparent font-extrabold text-rosa" onClick={desfazerUltimo}>
            <Undo2 size={16} /> Desfazer
          </button>
        </div>
      )}

      {editando && (
        <FormCuidado
          area={area}
          config={config}
          gruposExistentes={[...new Set([...config.grupos, ...meus.map((c) => c.grupo)])]}
          cuidado={editando === 'novo' ? null : editando}
          aoFechar={() => setEditando(null)}
        />
      )}
    </section>
  )
}

function FormCuidado({
  area, config, gruposExistentes, cuidado, aoFechar,
}: {
  area: Area
  config: ConfigCuidados
  gruposExistentes: string[]
  cuidado: Cuidado | null
  aoFechar: () => void
}) {
  const { criarCuidadosEmLote, atualizarCuidadoPorId, excluirCuidadoPorId } = useApp()
  const [nome, setNome] = useState(cuidado?.nome ?? '')
  const [grupo, setGrupo] = useState(cuidado?.grupo ?? config.grupos[0] ?? 'Geral')
  const [freq, setFreq] = useState<number>(cuidado?.frequencia_dias ?? 7)
  const [outra, setOutra] = useState(cuidado ? !FREQUENCIAS.some((f) => f.dias === cuidado.frequencia_dias) : false)
  const [ultima, setUltima] = useState(cuidado?.ultima_em ?? '')
  const [erro, setErro] = useState<string | null>(null)
  const hoje = hojeISO()

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return setErro('Dê um nome ao cuidado.')
    if (!Number.isInteger(freq) || freq < 1 || freq > 3650) return setErro('Escolha de quantos em quantos dias (de 1 a 3650).')
    if (ultima && ultima > hoje) return setErro('A última vez não pode ser no futuro.')
    const dados = { nome: nome.trim(), grupo: grupo.trim() || 'Geral', frequencia_dias: freq, ultima_em: ultima || null }
    if (cuidado) await atualizarCuidadoPorId(cuidado.id, { ...dados, anterior_em: ultima === cuidado.ultima_em ? cuidado.anterior_em : null })
    else await criarCuidadosEmLote([{ ...dados, area_id: area.id }])
    aoFechar()
  }

  async function excluir() {
    if (!cuidado) return
    if (!confirm(`Excluir “${cuidado.nome}”? Isso não pode ser desfeito.`)) return
    await excluirCuidadoPorId(cuidado.id)
    aoFechar()
  }

  return (
    <Folha titulo={cuidado ? 'Editar cuidado' : 'Novo cuidado'} aoFechar={aoFechar}>
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <div>
          <label className="rotulo" htmlFor="cu-nome">O que fazer</label>
          <input id="cu-nome" className="campo" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Limpar a geladeira" autoFocus />
        </div>
        <div>
          <label className="rotulo" htmlFor="cu-grupo">{area.chave === 'casa' ? 'Cômodo' : 'Tipo'}</label>
          <input id="cu-grupo" className="campo" list="cu-grupos" value={grupo} onChange={(e) => setGrupo(e.target.value)} />
          <datalist id="cu-grupos">
            {gruposExistentes.map((g) => <option key={g} value={g} />)}
          </datalist>
        </div>
        <div>
          <span className="rotulo">De quanto em quanto tempo?</span>
          <div className="flex flex-wrap gap-2">
            {FREQUENCIAS.map((f) => (
              <button
                type="button"
                key={f.dias}
                aria-pressed={!outra && freq === f.dias}
                onClick={() => { setOutra(false); setFreq(f.dias) }}
                className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold ${!outra && freq === f.dias ? 'border-transparent bg-destaque text-white' : 'border-borda bg-cartao'}`}
              >
                {f.nome}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={outra}
              onClick={() => setOutra(true)}
              className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold ${outra ? 'border-transparent bg-destaque text-white' : 'border-borda bg-cartao'}`}
            >
              Outro
            </button>
          </div>
          {outra && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm">A cada</span>
              <input
                aria-label="Quantidade de dias"
                type="number"
                min={1}
                max={3650}
                className="campo !w-24"
                value={Number.isNaN(freq) ? '' : freq}
                onChange={(e) => setFreq(e.target.value === '' ? NaN : Number(e.target.value))}
              />
              <span className="text-sm">dias</span>
            </div>
          )}
        </div>
        <div>
          <label className="rotulo" htmlFor="cu-ultima">Quando foi a última vez? (pode deixar vazio)</label>
          <input id="cu-ultima" type="date" max={hoje} className="campo" value={ultima} onChange={(e) => setUltima(e.target.value)} />
        </div>

        {erro && <p className="m-0 text-sm text-destaque" role="alert">{erro}</p>}
        <div className="flex gap-3">
          <button type="button" className="btn btn-suave" onClick={aoFechar}>Cancelar</button>
          <button className="btn flex-1">Salvar</button>
        </div>
        {cuidado && (
          <button type="button" className="border-0 bg-transparent text-sm font-bold text-suave" onClick={excluir}>
            Excluir este cuidado
          </button>
        )}
      </form>
    </Folha>
  )
}
