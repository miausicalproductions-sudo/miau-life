import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, CalendarPlus, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, MapPin, SlidersHorizontal, Target } from 'lucide-react'
import { useApp } from '../lib/ContextoApp'
import { useForm } from '../componentes/ContextoForm'
import ItemCartao, { CaixaMarca, useAlternar } from '../componentes/ItemCartao'
import { GatoRosto } from '../componentes/Gatinhos'
import { Icone, nomeIconeArea } from '../lib/icones'
import { conflitosDoDia, itensDoDia, type ItemDia } from '../lib/agenda'
import { dataCurta, dataLonga, diasDaSemana, gradeDoMes, hojeISO, iso, nomeDiaCurto, nomeMes, parseISO, SEMANA_SEG, somarDias } from '../lib/datas'

type Vista = 'mes' | 'semana' | 'dia' | 'lista'
const VISTAS: { id: Vista; rotulo: string }[] = [
  { id: 'mes', rotulo: 'Mês' },
  { id: 'semana', rotulo: 'Semana' },
  { id: 'dia', rotulo: 'Dia' },
  { id: 'lista', rotulo: 'Lista' },
]

export default function Agenda() {
  const [params, setParams] = useSearchParams()
  const { areas, atividades, ocorrencias } = useApp()
  const { abrirForm } = useForm()
  const hoje = hojeISO()

  const vista = (VISTAS.find((v) => v.id === params.get('vista'))?.id ?? 'mes') as Vista
  const dia = params.get('dia') ?? hoje
  const areaParam = params.get('area')
  const areaFiltro = areas.find((a) => a.id === areaParam) ?? null

  const [escondidos, setEscondidos] = useState<Set<string>>(new Set())
  const [menuAberto, setMenuAberto] = useState(false)
  const [filtros, setFiltros] = useState(false)

  const ir = (p: Record<string, string | null>) =>
    setParams(
      (prev) => {
        const n = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(p)) {
          if (v === null) n.delete(k)
          else n.set(k, v)
        }
        return n
      },
      { replace: true },
    )

  const visivel = (i: ItemDia) => {
    const a = i.atividade
    if (areaParam && a.area_id !== areaParam) return false
    if (i.categoria === 'presenca' && escondidos.has('presenca')) return false
    if (!areaParam && escondidos.has(a.area_id ?? 'sem-area')) return false
    return true
  }
  const itensDe = (d: string) => itensDoDia(d, atividades, ocorrencias).filter(visivel)
  const alternarFiltro = (chave: string) =>
    setEscondidos((prev) => {
      const n = new Set(prev)
      if (n.has(chave)) n.delete(chave)
      else n.add(chave)
      return n
    })

  const ativas = areas.filter((a) => !a.arquivada)
  const temSemArea = atividades.some((a) => !a.area_id && a.tipo !== 'caixa' && !a.excluida_em)

  return (
    <div className="flex flex-col gap-4">
      <header className="relative flex items-center justify-between gap-2">
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="flex items-center gap-2 border-0 bg-transparent p-0 text-left"
          aria-expanded={menuAberto}
          aria-label="Escolher calendário"
        >
          <CalendarPlus size={30} className="text-titulo" />
          <h1 className="m-0 text-2xl font-semibold text-titulo">{areaFiltro ? areaFiltro.nome : 'Calendário Geral'}</h1>
          <ChevronDown size={22} className="text-titulo" />
        </button>
        <button onClick={() => setFiltros(!filtros)} aria-label="Filtros" aria-pressed={filtros} className="cartao grid h-11 w-11 place-items-center !rounded-full border-0">
          <SlidersHorizontal size={20} className="text-titulo" />
        </button>
        {menuAberto && (
          <div className="cartao absolute left-0 top-12 z-20 w-64 !bg-cartao p-2">
            <button className="flex w-full items-center gap-2 rounded-xl border-0 bg-transparent px-3 py-2.5 text-left font-bold hover:bg-rosa/20" onClick={() => { ir({ area: null }); setMenuAberto(false) }}>
              <CalendarPlus size={20} /> Calendário Geral
            </button>
            {ativas.map((a) => (
              <button key={a.id} className="flex w-full items-center gap-2 rounded-xl border-0 bg-transparent px-3 py-2.5 text-left font-bold hover:bg-rosa/20" onClick={() => { ir({ area: a.id }); setMenuAberto(false) }}>
                <Icone nome={nomeIconeArea(a)} size={20} /> {a.nome}
              </button>
            ))}
          </div>
        )}
      </header>

      <div role="tablist" aria-label="Tipo de visão" className="cartao grid grid-cols-4 gap-1 !rounded-full p-1">
        {VISTAS.map((v) => (
          <button
            key={v.id}
            role="tab"
            aria-selected={vista === v.id}
            onClick={() => ir({ vista: v.id })}
            className={`h-10 rounded-full border-0 text-sm font-extrabold ${vista === v.id ? 'bg-destaque text-white' : 'bg-transparent'}`}
          >
            {v.rotulo}
          </button>
        ))}
      </div>

      {vista === 'mes' && <VistaMes dia={dia} hoje={hoje} itensDe={itensDe} ir={ir} />}
      {vista === 'semana' && <VistaSemana dia={dia} hoje={hoje} itensDe={itensDe} ir={ir} />}
      {vista === 'dia' && <VistaDia dia={dia} hoje={hoje} itensDe={itensDe} ir={ir} />}
      {vista === 'lista' && <VistaLista dia={dia} hoje={hoje} itensDe={itensDe} />}

      {(vista === 'mes' || filtros) && (
        <section className="cartao p-4" aria-label="Cores e prioridades">
          <h2 className="m-0 mb-3 text-lg font-semibold text-titulo">Cores e Prioridades</h2>
          {areaFiltro && (
            <p className="mb-3 mt-0 text-sm text-suave">
              Mostrando só <b>{areaFiltro.nome}</b>.{' '}
              <button className="border-0 bg-transparent p-0 font-bold text-titulo" onClick={() => ir({ area: null })}>Ver tudo</button>
            </p>
          )}
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            <LinhaLegenda
              cor="var(--cf-presenca)"
              icone={<MapPin size={18} />}
              titulo="Presença obrigatória"
              dica="Você precisa estar presente (consulta, prova, aula…)"
              ligada={!escondidos.has('presenca')}
              aoAlternar={() => alternarFiltro('presenca')}
            />
            {ativas.map((a) => (
              <LinhaLegenda
                key={a.id}
                cor={`var(--cf-${a.cor})`}
                icone={<Icone nome={nomeIconeArea(a)} size={18} />}
                titulo={a.nome}
                dica={null}
                ligada={areaParam ? a.id === areaParam : !escondidos.has(a.id)}
                aoAlternar={() => alternarFiltro(a.id)}
                desativada={!!areaParam}
              />
            ))}
            {temSemArea && (
              <LinhaLegenda cor="var(--cf-rosa)" icone={<Icone nome="star" size={18} />} titulo="Sem área" dica={null} ligada={!escondidos.has('sem-area')} aoAlternar={() => alternarFiltro('sem-area')} desativada={!!areaParam} />
            )}
          </ul>
        </section>
      )}
    </div>
  )
}

function LinhaLegenda({ cor, icone, titulo, dica, ligada, aoAlternar, desativada = false }: { cor: string; icone: React.ReactNode; titulo: string; dica: string | null; ligada: boolean; aoAlternar: () => void; desativada?: boolean }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl px-3 py-2" style={{ background: `color-mix(in srgb, ${cor} 16%, transparent)` }}>
      <span style={{ color: cor }}>{icone}</span>
      <span className="flex-1">
        <span className="block text-sm font-extrabold" style={{ color: cor }}>{titulo}</span>
        {dica && <span className="block text-xs text-suave">{dica}</span>}
      </span>
      <button
        role="checkbox"
        aria-checked={ligada}
        aria-label={`Mostrar ${titulo}`}
        disabled={desativada}
        onClick={aoAlternar}
        data-on={ligada}
        className="caixa-marca disabled:opacity-60"
        style={ligada ? { background: cor, borderColor: cor } : undefined}
      >
        {ligada && <Check size={17} strokeWidth={3.5} />}
      </button>
    </li>
  )
}

interface PropsVista {
  dia: string
  hoje: string
  itensDe: (d: string) => ItemDia[]
  ir: (p: Record<string, string | null>) => void
}

function corDoItem(i: ItemDia, areas: { id: string; cor: string }[]): string {
  if (i.categoria === 'presenca') return 'var(--cf-presenca)'
  const a = areas.find((x) => x.id === i.atividade.area_id)
  return `var(--cf-${a?.cor ?? 'rosa'})`
}

// ---------------- MÊS ----------------
function VistaMes({ dia, hoje, itensDe, ir }: PropsVista) {
  const { areas } = useApp()
  const d = parseISO(dia)
  const ano = d.getFullYear()
  const mes0 = d.getMonth()
  const grade = useMemo(() => gradeDoMes(ano, mes0), [ano, mes0])

  return (
    <section className="cartao p-3" aria-label={`${nomeMes(mes0)} ${ano}`}>
      <div className="mb-3 flex items-center justify-between">
        <button aria-label="Mês anterior" className="grid h-10 w-10 place-items-center rounded-full border-0 bg-transparent" onClick={() => ir({ dia: iso(new Date(ano, mes0 - 1, 1)) })}>
          <ChevronLeft className="text-titulo" />
        </button>
        <h2 className="m-0 text-xl font-semibold text-titulo">{nomeMes(mes0)} {ano}</h2>
        <button aria-label="Próximo mês" className="grid h-10 w-10 place-items-center rounded-full border-0 bg-transparent" onClick={() => ir({ dia: iso(new Date(ano, mes0 + 1, 1)) })}>
          <ChevronRight className="text-titulo" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs font-extrabold text-suave">
        {SEMANA_SEG.map((s) => (
          <div key={s} className="py-1">{s}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {grade.map((g) => {
          const dentro = parseISO(g).getMonth() === mes0
          const ehHoje = g === hoje
          const itens = itensDe(g).filter((i) => i.categoria !== 'rotina')
          const cores = [...new Set(itens.map((i) => corDoItem(i, areas)))].slice(0, 3)
          return (
            <button
              key={g}
              onClick={() => ir({ vista: 'dia', dia: g })}
              aria-label={`${dataLonga(g)}${itens.length ? `, ${itens.length} itens` : ''}`}
              className={`flex h-12 flex-col items-center justify-center gap-0.5 rounded-xl border-0 ${ehHoje ? 'bg-destaque text-white' : 'bg-transparent'} ${dentro ? '' : 'opacity-40'}`}
            >
              <span className="text-[15px] font-extrabold leading-none">{parseISO(g).getDate()}</span>
              <span className="flex h-2 items-center gap-0.5">
                {cores.map((c) => (
                  <span key={c} className="h-1.5 w-1.5 rounded-full" style={{ background: ehHoje ? '#fff' : c }} />
                ))}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

// ---------------- SEMANA ----------------
function VistaSemana({ dia, hoje, itensDe, ir }: PropsVista) {
  const { areas } = useApp()
  const { abrirForm } = useForm()
  const dias = diasDaSemana(dia)
  return (
    <section className="flex flex-col gap-3" aria-label="Semana">
      <div className="cartao flex items-center justify-between p-2">
        <button aria-label="Semana anterior" className="grid h-10 w-10 place-items-center rounded-full border-0 bg-transparent" onClick={() => ir({ dia: somarDias(dia, -7) })}>
          <ChevronLeft className="text-titulo" />
        </button>
        <span className="font-display text-lg font-semibold text-titulo">{dataCurta(dias[0])} a {dataCurta(dias[6])}</span>
        <button aria-label="Próxima semana" className="grid h-10 w-10 place-items-center rounded-full border-0 bg-transparent" onClick={() => ir({ dia: somarDias(dia, 7) })}>
          <ChevronRight className="text-titulo" />
        </button>
      </div>
      {dias.map((d) => {
        const itens = itensDe(d)
        return (
          <div key={d} className={`cartao p-3 ${d === hoje ? '!border-destaque' : ''}`}>
            <button onClick={() => ir({ vista: 'dia', dia: d })} className="mb-1 flex w-full items-center justify-between border-0 bg-transparent p-0 text-left">
              <span className={`font-display text-base font-semibold ${d === hoje ? 'text-destaque' : 'text-titulo'}`}>{nomeDiaCurto(d)} · {dataCurta(d)}</span>
              <ChevronRight size={18} className="text-suave" />
            </button>
            {itens.length === 0 ? (
              <p className="m-0 text-sm text-suave">Livre</p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {itens.map((i) => (
                  <li key={i.chave}>
                    <button onClick={() => abrirForm({ editar: i.atividade })} className="flex w-full items-center gap-2 border-0 bg-transparent p-0 text-left">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: corDoItem(i, areas) }} />
                      {i.hora && <span className="text-xs font-bold text-suave">{i.hora}</span>}
                      <span className={`truncate text-sm font-bold ${i.feito ? 'line-through opacity-60' : ''}`}>{i.atividade.titulo}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </section>
  )
}

// ---------------- DIA ----------------
function VistaDia({ dia, hoje, itensDe, ir }: PropsVista) {
  const { areas } = useApp()
  const { abrirForm } = useForm()
  const alternar = useAlternar()
  const itens = itensDe(dia)
  const conflitos = conflitosDoDia(itens)
  const comHora = itens.filter((i) => i.hora)
  const semHora = itens.filter((i) => !i.hora)
  const nPresencas = itens.filter((i) => i.categoria === 'presenca').length
  const nPrazos = itens.filter((i) => i.categoria === 'prazo').length
  const nFlex = itens.filter((i) => i.categoria === 'flexivel').length

  return (
    <section className="flex flex-col gap-3" aria-label="Agenda do dia">
      <div className="cartao flex items-center justify-between p-2">
        <button aria-label="Dia anterior" className="grid h-10 w-10 place-items-center rounded-full border-0 bg-transparent" onClick={() => ir({ dia: somarDias(dia, -1) })}>
          <ChevronLeft className="text-titulo" />
        </button>
        <button onClick={() => ir({ dia: hoje })} className="border-0 bg-transparent font-display text-xl font-semibold text-titulo" aria-label="Voltar para hoje">
          {dataLonga(dia)}
        </button>
        <button aria-label="Próximo dia" className="grid h-10 w-10 place-items-center rounded-full border-0 bg-transparent" onClick={() => ir({ dia: somarDias(dia, 1) })}>
          <ChevronRight className="text-titulo" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs font-extrabold">
        <div className="cartao flex flex-col items-center gap-1 p-2"><MapPin size={20} style={{ color: 'var(--cf-presenca)' }} />{nPresencas} {nPresencas === 1 ? 'Presença' : 'Presenças'}<span className="font-semibold text-suave">obrigatórias</span></div>
        <div className="cartao flex flex-col items-center gap-1 p-2"><Clock size={20} className="text-amber-500" />{nPrazos} {nPrazos === 1 ? 'Tarefa' : 'Tarefas'}<span className="font-semibold text-suave">com prazo</span></div>
        <div className="cartao flex flex-col items-center gap-1 p-2"><Target size={20} className="text-emerald-500" />{nFlex} {nFlex === 1 ? 'Tarefa' : 'Tarefas'}<span className="font-semibold text-suave">flexíveis</span></div>
      </div>

      {conflitos.length > 0 && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl bg-pessego/70 px-4 py-3 text-sm">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-titulo" />
          <span>
            <b>Atenção, conflito de horário:</b>{' '}
            {conflitos.map((c) => `${c.a.atividade.titulo} (${c.a.hora}) e ${c.b.atividade.titulo} (${c.b.hora})`).join('; ')}.
          </span>
        </div>
      )}

      {itens.length === 0 && (
        <div className="cartao flex flex-col items-center gap-2 p-6 text-center">
          <GatoRosto className="h-24 w-32" olhos="feliz" />
          <p className="m-0 font-bold">Nada marcado para este dia</p>
          <p className="m-0 text-sm text-suave">Um dia livre, miau!</p>
        </div>
      )}

      {comHora.length > 0 && (
        <ol className="relative m-0 flex list-none flex-col gap-3 p-0">
          <span className="absolute bottom-2 top-2 w-0.5 rounded bg-rosa/60" style={{ left: 33 }} aria-hidden />
          {comHora.map((i) => (
            <li key={i.chave} className="relative flex items-start gap-3">
              <span className="z-[1] w-[68px] shrink-0 rounded-full py-1.5 text-center text-sm font-extrabold text-white" style={{ background: corDoItem(i, areas) }}>
                {i.hora}
              </span>
              <div className="min-w-0 flex-1">
                <ItemCartao item={i} aoAbrir={() => abrirForm({ editar: i.atividade })} />
              </div>
            </li>
          ))}
        </ol>
      )}

      {semHora.length > 0 && (
        <div className="cartao p-4">
          <h2 className="m-0 mb-3 flex items-center gap-2 text-lg font-semibold text-titulo">
            <Check size={22} className="rounded-full bg-emerald-500 p-0.5 text-white" /> Outras tarefas do dia
          </h2>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {semHora.map((i) => (
              <li key={i.chave} className="flex items-center gap-3 border-b border-borda py-2.5 last:border-0">
                <CaixaMarca ligada={i.feito} aoClicar={() => alternar(i)} rotulo={i.feito ? `Desmarcar ${i.atividade.titulo}` : `Concluir ${i.atividade.titulo}`} />
                <button onClick={() => abrirForm({ editar: i.atividade })} className={`flex-1 border-0 bg-transparent p-0 text-left font-bold ${i.feito ? 'line-through opacity-60' : ''}`}>
                  {i.atividade.titulo}
                </button>
                {i.categoria === 'prazo' && <span className="text-xs font-bold text-amber-600">prazo</span>}
                {i.categoria === 'flexivel' && <span className="text-xs font-bold text-emerald-600">meta</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button className="btn btn-suave self-center" onClick={() => abrirForm({ dia, tipoInicial: 'agendada' })}>
        <CalendarPlus size={18} /> Adicionar neste dia
      </button>
    </section>
  )
}

// ---------------- LISTA ----------------
function VistaLista({ dia, hoje, itensDe }: Omit<PropsVista, 'ir'>) {
  const { abrirForm } = useForm()
  const { atividades } = useApp()
  const inicio = dia
  const grupos = useMemo(() => {
    const out: { dia: string; itens: ItemDia[] }[] = []
    for (let k = 0; k < 30; k++) {
      const d = somarDias(inicio, k)
      const itens = itensDe(d).filter((i) => i.categoria !== 'rotina')
      if (itens.length) out.push({ dia: d, itens })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inicio, itensDe])

  const atrasadas = atividades.filter(
    (a) => !a.excluida_em && a.status === 'pendente' && ((a.tipo === 'prazo' && a.prazo && a.prazo < hoje) || ((a.tipo === 'agendada' || a.tipo === 'compromisso') && a.dia && a.dia < hoje)),
  )

  return (
    <section className="flex flex-col gap-3" aria-label="Lista dos próximos 30 dias">
      {atrasadas.length > 0 && (
        <div className="cartao p-3">
          <h2 className="m-0 mb-2 text-base font-semibold text-titulo">Atrasadas</h2>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {atrasadas.map((a) => (
              <li key={a.id}>
                <button onClick={() => abrirForm({ editar: a })} className="flex w-full items-center gap-2 border-0 bg-transparent p-0 text-left text-sm font-bold">
                  <span className="text-xs text-destaque">{dataCurta((a.prazo ?? a.dia) as string)}</span>
                  {a.titulo}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {grupos.length === 0 && <p className="cartao m-0 p-6 text-center text-suave">Nada marcado nos próximos 30 dias.</p>}
      {grupos.map((g) => (
        <div key={g.dia} className="flex flex-col gap-2">
          <h2 className={`m-0 mt-1 text-base font-semibold ${g.dia === hoje ? 'text-destaque' : 'text-titulo'}`}>
            {dataLonga(g.dia)}
            {g.dia === hoje && ' · hoje'}
          </h2>
          {g.itens.map((i) => (
            <ItemCartao key={i.chave} item={i} aoAbrir={() => abrirForm({ editar: i.atividade })} />
          ))}
        </div>
      ))}
    </section>
  )
}
