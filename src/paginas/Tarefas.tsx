import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Calendar, Check, Inbox, Pencil, Plus, Repeat, RotateCcw, Trash2 } from 'lucide-react'
import { useApp } from '../lib/ContextoApp'
import { useForm } from '../componentes/ContextoForm'
import ItemCartao, { CaixaMarca } from '../componentes/ItemCartao'
import { GatoRosto } from '../componentes/Gatinhos'
import { ativa, itensDoDia, metasDaSemana, type ItemDia } from '../lib/agenda'
import { dataCurta, diasDaSemana, hojeISO, parseISO, SEMANA_SEG } from '../lib/datas'
import type { Atividade } from '../lib/tipos'

type Aba = 'pendencias' | 'metas' | 'rotinas' | 'caixa' | 'lixeira'

export default function Tarefas() {
  const [params, setParams] = useSearchParams()
  const { atividades, ocorrencias } = useApp()
  const hoje = hojeISO()
  const aba = (params.get('aba') ?? 'pendencias') as Aba

  const vivas = atividades.filter(ativa)
  const contagens: Record<Aba, number> = {
    pendencias: vivas.filter((a) => a.status === 'pendente' && ['compromisso', 'agendada', 'prazo'].includes(a.tipo)).length,
    metas: metasDaSemana(hoje, atividades, ocorrencias).metas.length,
    rotinas: vivas.filter((a) => a.tipo === 'rotina').length,
    caixa: vivas.filter((a) => a.tipo === 'caixa' && a.status === 'pendente').length,
    lixeira: atividades.filter((a) => a.excluida_em).length,
  }
  const abas: { id: Aba; rotulo: string }[] = [
    { id: 'pendencias', rotulo: 'Pendências' },
    { id: 'metas', rotulo: 'Metas' },
    { id: 'rotinas', rotulo: 'Rotinas' },
    { id: 'caixa', rotulo: 'Caixa' },
    { id: 'lixeira', rotulo: 'Lixeira' },
  ]

  return (
    <div className="flex flex-col gap-4">
      <h1 className="m-0 text-2xl font-semibold text-titulo">Tarefas</h1>
      <div className="rolagem-x -mx-4 flex gap-2 px-4" role="tablist" aria-label="Tipos de tarefa">
        {abas.map((a) => (
          <button
            key={a.id}
            role="tab"
            aria-selected={aba === a.id}
            onClick={() => setParams({ aba: a.id }, { replace: true })}
            className={`h-10 shrink-0 rounded-full border-2 px-4 text-sm font-extrabold ${aba === a.id ? 'border-destaque bg-destaque text-white' : 'border-borda bg-transparent'}`}
          >
            {a.rotulo}
            {contagens[a.id] > 0 && <span className="ml-1.5 opacity-80">{contagens[a.id]}</span>}
          </button>
        ))}
      </div>

      {aba === 'pendencias' && <Pendencias hoje={hoje} />}
      {aba === 'metas' && <Metas hoje={hoje} />}
      {aba === 'rotinas' && <Rotinas hoje={hoje} />}
      {aba === 'caixa' && <Caixa />}
      {aba === 'lixeira' && <Lixeira />}
    </div>
  )
}

function Vazio({ titulo, texto, acao }: { titulo: string; texto: string; acao?: React.ReactNode }) {
  return (
    <div className="cartao flex flex-col items-center gap-2 p-6 text-center">
      <GatoRosto className="h-24 w-32" olhos="feliz" />
      <p className="m-0 font-bold">{titulo}</p>
      <p className="m-0 text-sm text-suave">{texto}</p>
      {acao}
    </div>
  )
}

function itemDe(a: Atividade): ItemDia | null {
  const d = a.tipo === 'prazo' ? a.prazo : a.dia
  return d ? (itensDoDia(d, [a], [])[0] ?? null) : null
}

// ---------------- PENDÊNCIAS ----------------
function Pendencias({ hoje }: { hoje: string }) {
  const { atividades } = useApp()
  const { abrirForm } = useForm()
  const [feitas, setFeitas] = useState(false)

  const { atrasadas, deHoje, proximas, concluidas } = useMemo(() => {
    const todas = atividades
      .filter((a) => ativa(a) && ['compromisso', 'agendada', 'prazo'].includes(a.tipo))
      .map(itemDe)
      .filter((i): i is ItemDia => !!i)
    const pend = todas.filter((i) => !i.feito).sort((x, y) => x.dia.localeCompare(y.dia) || (x.inicioMs ?? 0) - (y.inicioMs ?? 0))
    return {
      atrasadas: pend.filter((i) => i.dia < hoje),
      deHoje: pend.filter((i) => i.dia === hoje),
      proximas: pend.filter((i) => i.dia > hoje),
      concluidas: todas
        .filter((i) => i.feito)
        .sort((x, y) => (y.atividade.concluida_em ?? '').localeCompare(x.atividade.concluida_em ?? ''))
        .slice(0, 15),
    }
  }, [atividades, hoje])

  const grupo = (titulo: string, itens: ItemDia[], destaque = false) =>
    itens.length > 0 && (
      <section className="flex flex-col gap-2">
        <h2 className={`m-0 text-base font-semibold ${destaque ? 'text-destaque' : 'text-titulo'}`}>{titulo}</h2>
        {itens.map((i) => (
          <ItemCartao key={i.chave} item={i} mostrarData aoAbrir={() => abrirForm({ editar: i.atividade })} />
        ))}
      </section>
    )

  const vazio = atrasadas.length + deHoje.length + proximas.length === 0
  return (
    <div className="flex flex-col gap-4">
      {vazio && (
        <Vazio
          titulo="Nenhuma pendência"
          texto="Tarefas com prazo, agendadas e compromissos aparecem aqui."
          acao={<button className="btn" onClick={() => abrirForm({ tipoInicial: 'prazo' })}><Plus size={18} /> Nova tarefa</button>}
        />
      )}
      {grupo('Atrasadas', atrasadas, true)}
      {grupo('Hoje', deHoje)}
      {grupo('Próximas', proximas)}
      {concluidas.length > 0 && (
        <>
          <button className="btn btn-suave self-start" onClick={() => setFeitas(!feitas)}>
            <Check size={18} /> {feitas ? 'Esconder' : 'Ver'} concluídas ({concluidas.length})
          </button>
          {feitas && (
            <div className="flex flex-col gap-2">
              {concluidas.map((i) => (
                <ItemCartao key={i.chave} item={i} mostrarData aoAbrir={() => abrirForm({ editar: i.atividade })} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ---------------- METAS DA SEMANA (tarefas flexíveis) ----------------
function Metas({ hoje }: { hoje: string }) {
  const { atividades, ocorrencias, marcarOcorrencia } = useApp()
  const { abrirForm } = useForm()
  const { metas, percentual } = metasDaSemana(hoje, atividades, ocorrencias)
  const dias = diasDaSemana(hoje)

  // Toque no dia: livre → programado → feito → livre
  const ciclar = (id: string, d: string) => {
    const o = ocorrencias.find((x) => x.atividade_id === id && x.dia === d)
    marcarOcorrencia(id, d, !o ? 'planejada' : !o.feito ? 'feita' : null)
  }

  if (metas.length === 0) {
    return (
      <Vazio
        titulo="Nenhuma meta da semana ainda"
        texto="Ex.: Academia 3x, Estudar 4x, Banho dos cachorros 1x. Elas não ocupam o calendário até você escolher o dia."
        acao={<button className="btn" onClick={() => abrirForm({ tipoInicial: 'flexivel' })}><Plus size={18} /> Criar meta</button>}
      />
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="cartao p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-lg font-semibold text-titulo">Esta semana</span>
          <span className="font-display text-xl font-semibold text-suave">{percentual}%</span>
        </div>
        <div className="barra-trilho"><div className="barra-valor" style={{ width: `${percentual}%` }} /></div>
        <p className="mb-0 mt-3 text-xs text-suave">
          Toque em um dia para <b>programar</b> (ele vai para a Agenda), toque de novo para marcar como <b>feito</b>, e mais uma vez para limpar.
        </p>
      </div>

      {metas.map((m) => (
        <div key={m.atividade.id} className="cartao p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex-1 font-display text-lg font-semibold">{m.atividade.titulo}</span>
            <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${m.feitas >= m.meta ? 'bg-emerald-500 text-white' : 'bg-rosa/40'}`}>
              {Math.min(m.feitas, m.meta)}/{m.meta}
            </span>
            <button aria-label={`Editar ${m.atividade.titulo}`} className="grid h-9 w-9 place-items-center rounded-full border-0 bg-transparent" onClick={() => abrirForm({ editar: m.atividade })}>
              <Pencil size={18} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {dias.map((d, i) => {
              const o = ocorrencias.find((x) => x.atividade_id === m.atividade.id && x.dia === d)
              const estado = !o ? 'livre' : o.feito ? 'feito' : 'programado'
              return (
                <button
                  key={d}
                  onClick={() => ciclar(m.atividade.id, d)}
                  aria-label={`${SEMANA_SEG[i]} ${dataCurta(d)}: ${estado}`}
                  className={`flex h-16 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 text-xs font-bold ${
                    estado === 'feito' ? 'border-emerald-500 bg-emerald-500 text-white' : estado === 'programado' ? 'border-destaque bg-rosa/40' : d === hoje ? 'border-destaque bg-transparent' : 'border-borda bg-transparent'
                  }`}
                >
                  <span>{SEMANA_SEG[i]}</span>
                  <span className="text-base font-extrabold leading-none">{parseISO(d).getDate()}</span>
                  {estado === 'feito' ? <Check size={14} strokeWidth={3} /> : estado === 'programado' ? <Calendar size={14} /> : <span className="h-3.5" />}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      <button className="btn btn-suave self-center" onClick={() => abrirForm({ tipoInicial: 'flexivel' })}><Plus size={18} /> Nova meta</button>
    </div>
  )
}

// ---------------- ROTINAS ----------------
function Rotinas({ hoje }: { hoje: string }) {
  const { atividades, ocorrencias, marcarOcorrencia } = useApp()
  const { abrirForm } = useForm()
  const rotinas = atividades.filter((a) => ativa(a) && a.tipo === 'rotina')
  const dow = parseISO(hoje).getDay()
  const ordem = [1, 2, 3, 4, 5, 6, 0]

  if (rotinas.length === 0) {
    return (
      <Vazio
        titulo="Nenhuma rotina ainda"
        texto="Skincare da manhã e da noite, tomar água, remédio do pet… coisas que se repetem todo dia."
        acao={<button className="btn" onClick={() => abrirForm({ tipoInicial: 'rotina' })}><Plus size={18} /> Criar rotina</button>}
      />
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {rotinas.map((a) => {
        const hojeVale = !a.dias_semana || a.dias_semana.length === 0 || a.dias_semana.includes(dow)
        const feito = !!ocorrencias.find((o) => o.atividade_id === a.id && o.dia === hoje && o.feito)
        const quando = !a.dias_semana || a.dias_semana.length === 0 ? 'Todos os dias' : ordem.filter((v) => a.dias_semana!.includes(v)).map((v) => SEMANA_SEG[ordem.indexOf(v)]).join(', ')
        return (
          <div key={a.id} className="cartao flex items-center gap-3 p-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lilas/50 text-titulo"><Repeat size={22} /></span>
            <button className="min-w-0 flex-1 border-0 bg-transparent p-0 text-left" onClick={() => abrirForm({ editar: a })}>
              <span className="block truncate font-extrabold">{a.titulo}</span>
              <span className="text-xs text-suave">{quando}</span>
            </button>
            {hojeVale ? (
              <CaixaMarca ligada={feito} rotulo={feito ? `Desmarcar ${a.titulo} de hoje` : `Marcar ${a.titulo} de hoje`} aoClicar={() => marcarOcorrencia(a.id, hoje, feito ? null : 'feita')} />
            ) : (
              <span className="text-xs text-suave">hoje não</span>
            )}
          </div>
        )
      })}
      <button className="btn btn-suave mt-1 self-center" onClick={() => abrirForm({ tipoInicial: 'rotina' })}><Plus size={18} /> Nova rotina</button>
    </div>
  )
}

// ---------------- CAIXA DE ENTRADA ----------------
function Caixa() {
  const { atividades } = useApp()
  const { abrirForm } = useForm()
  const caixa = atividades.filter((a) => ativa(a) && a.tipo === 'caixa' && a.status === 'pendente')

  if (caixa.length === 0) {
    return (
      <Vazio
        titulo="Caixa de entrada vazia"
        texto="Anote qualquer coisa com o botão + e escolha “Só anotar”. Depois você decide a área e o dia."
        acao={<button className="btn" onClick={() => abrirForm({ tipoInicial: 'caixa' })}><Inbox size={18} /> Anotar agora</button>}
      />
    )
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="m-0 text-sm text-suave">Toque em “Organizar” para escolher o tipo, a área e o dia.</p>
      {caixa.map((a) => (
        <div key={a.id} className="cartao flex items-center gap-3 p-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lilas/50 text-titulo"><Inbox size={22} /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-extrabold">{a.titulo}</span>
            <span className="text-xs text-suave">anotada em {dataCurta(new Date(a.created_at).toLocaleDateString('sv-SE'))}</span>
          </span>
          <button className="btn !min-h-10 !px-4 text-sm" onClick={() => abrirForm({ editar: a })}>Organizar</button>
        </div>
      ))}
    </div>
  )
}

// ---------------- LIXEIRA ----------------
function Lixeira() {
  const { atividades, atualizar, excluirParaSempre } = useApp()
  const lixo = atividades.filter((a) => a.excluida_em)

  if (lixo.length === 0) {
    return <Vazio titulo="Lixeira vazia" texto="O que você mover para a lixeira fica aqui, e pode ser restaurado." />
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="m-0 text-sm text-suave">Nada some de verdade sem a sua confirmação.</p>
      {lixo.map((a) => (
        <div key={a.id} className="cartao flex items-center gap-2 p-3">
          <span className="min-w-0 flex-1 truncate font-bold">{a.titulo}</span>
          <button className="btn btn-suave !min-h-10 !px-3 text-sm" onClick={() => atualizar(a.id, { excluida_em: null })}>
            <RotateCcw size={16} /> Restaurar
          </button>
          <button
            aria-label={`Excluir ${a.titulo} para sempre`}
            className="grid h-10 w-10 place-items-center rounded-full border-0 bg-transparent text-suave"
            onClick={() => confirm(`Excluir “${a.titulo}” para sempre? Isso não pode ser desfeito.`) && excluirParaSempre(a.id)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  )
}

