import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Bell, CalendarDays, ChevronRight, Clock, Inbox, Plus, Target } from 'lucide-react'
import { useApp } from '../lib/ContextoApp'
import { useForm } from '../componentes/ContextoForm'
import { CaixaMarca } from '../componentes/ItemCartao'
import Folha from '../componentes/Folha'
import { GatoAlmofada, GatoPrancheta } from '../componentes/Gatinhos'
import { Icone, nomeIconeArea } from '../lib/icones'
import { infoPadrao } from '../lib/areasPadrao'
import { quantosPrecisam } from '../lib/cuidados'
import { alertas, conflitosDoDia, itensDoDia, metasDaSemana, pendenciasDaArea } from '../lib/agenda'
import { dataCurta, dataLonga, hojeISO } from '../lib/datas'
import type { Area } from '../lib/tipos'

function saudacao() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

export default function Inicio() {
  const { nome, areas, atividades, ocorrencias, cuidados, erro, carregando, marcarOcorrencia } = useApp()
  const { abrirForm } = useForm()
  const [verAlertas, setVerAlertas] = useState(false)
  const hoje = hojeISO()

  const doDia = useMemo(() => itensDoDia(hoje, atividades, ocorrencias).filter((i) => i.categoria !== 'rotina'), [hoje, atividades, ocorrencias])
  const conflitosHoje = useMemo(() => conflitosDoDia(doDia), [doDia])
  const al = useMemo(() => alertas(hoje, atividades, ocorrencias), [hoje, atividades, ocorrencias])
  const { metas, percentual } = useMemo(() => metasDaSemana(hoje, atividades, ocorrencias), [hoje, atividades, ocorrencias])
  const totalAlertas = al.atrasadas.length + al.conflitos.length + (al.caixa.length > 0 ? 1 : 0)

  const ativas = areas.filter((a) => !a.arquivada).sort((a, b) => a.posicao - b.posicao)
  const grandes = ativas.slice(0, 6)
  const pequenas = ativas.slice(6, 9)

  const resumo = doDia.length === 0 ? 'Nada marcado hoje' : `${doDia.length} ${doDia.length === 1 ? 'compromisso' : 'compromissos'} hoje`

  return (
    <div className="flex flex-col gap-5">
      <header className="relative flex items-center gap-1 pr-14">
        <GatoAlmofada className="-ml-1 h-24 w-36 shrink-0" />
        <div className="min-w-0">
          <h1 className="titulo-miau m-0 text-[34px] leading-none">Miau Life</h1>
          <p className="m-0 mt-1.5 text-sm font-semibold text-suave">
            {saudacao()}, {nome}!
          </p>
        </div>
        <button
          onClick={() => setVerAlertas(true)}
          aria-label={totalAlertas > 0 ? `Alertas (${totalAlertas})` : 'Alertas'}
          className="cartao absolute right-0 top-1 grid h-12 w-12 place-items-center !rounded-full border-0"
        >
          <Bell size={24} className="text-titulo" />
          {totalAlertas > 0 && <span className="selo absolute -right-1 -top-1">{totalAlertas}</span>}
        </button>
      </header>

      {erro && (
        <div role="alert" className="rounded-2xl bg-pessego/60 px-4 py-3 text-sm">
          Não consegui carregar ou salvar agora. Confira a internet. <span className="opacity-70">({erro})</span>
        </div>
      )}

      <Link to={`/agenda?vista=dia&dia=${hoje}`} className="cartao flex items-center gap-4 p-4 no-underline" style={{ color: 'inherit' }}>
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-rosa/50 text-titulo">
          <CalendarDays size={30} />
        </span>
        <span className="flex-1">
          <span className="block font-display text-xl font-semibold text-titulo">{dataLonga(hoje)}</span>
          <span className="text-sm text-suave">{carregando ? 'Carregando…' : resumo}</span>
        </span>
        <ChevronRight className="text-titulo" />
      </Link>

      {conflitosHoje.length > 0 && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl bg-pessego/70 px-4 py-3 text-sm">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-titulo" />
          <span>
            <b>Conflito de horário hoje:</b> {conflitosHoje[0].a.atividade.titulo} ({conflitosHoje[0].a.hora}) e {conflitosHoje[0].b.atividade.titulo} ({conflitosHoje[0].b.hora}).
          </span>
        </div>
      )}

      {ativas.length === 0 && !carregando && (
        <p className="cartao m-0 p-5 text-center text-suave">Você ainda não tem áreas. Crie a primeira em “Mais áreas”.</p>
      )}

      <section aria-label="Minhas áreas" className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          {grandes.map((a) => (
            <CartaoAreaGrande key={a.id} area={a} n={pendenciasDaArea(a.id, hoje, atividades, ocorrencias) + quantosPrecisam(cuidados, a.id, hoje)} />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {pequenas.map((a) => (
            <Link key={a.id} to={`/area/${a.id}`} className={`cartao-area cor-${a.cor} flex flex-col items-center gap-1 px-1 py-3 text-center text-xs font-extrabold no-underline`} style={{ color: 'inherit' }}>
              <Icone nome={nomeIconeArea(a)} size={30} className="icone-forte" />
              <span className="leading-tight">{a.nome}</span>
            </Link>
          ))}
          <Link to="/areas" className="cartao flex flex-col items-center justify-center gap-1 px-1 py-3 text-xs font-extrabold no-underline" style={{ color: 'inherit' }}>
            <Plus size={30} className="text-titulo" />
            Mais
          </Link>
        </div>
      </section>

      <Link to="/agenda" className="cartao flex items-center gap-4 p-4 no-underline" style={{ color: 'inherit' }}>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rosa/50 text-titulo">
          <CalendarDays size={26} />
        </span>
        <span className="flex-1">
          <span className="block font-display text-lg font-semibold text-titulo">Calendário Geral</span>
          <span className="text-sm text-suave">Visão completa e compromissos importantes</span>
        </span>
        <ChevronRight className="text-titulo" />
      </Link>

      <section className="cartao relative overflow-hidden p-4 pb-5" aria-label="Metas da semana">
        <div className="mb-2 flex items-center gap-2">
          <Target size={26} className="text-titulo" />
          <h2 className="m-0 flex-1 text-lg font-semibold text-titulo">Minhas Metas da Semana</h2>
          {metas.length > 0 && <span className="font-display text-xl font-semibold text-suave">{percentual}%</span>}
        </div>
        {metas.length === 0 ? (
          <div className="pr-28">
            <p className="mt-1 text-sm text-suave">Academia 3x, estudar 4x, banho dos cachorros… Crie metas flexíveis: elas não ocupam o seu calendário.</p>
            <button className="btn !min-h-10 text-sm" onClick={() => abrirForm({ tipoInicial: 'flexivel' })}>
              <Plus size={16} /> Criar meta
            </button>
          </div>
        ) : (
          <>
            <div className="barra-trilho mb-3" role="progressbar" aria-valuenow={percentual} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da semana">
              <div className="barra-valor" style={{ width: `${percentual}%` }} />
            </div>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 pr-24">
              {metas.slice(0, 4).map((m) => (
                <li key={m.atividade.id} className="flex items-center gap-3">
                  <CaixaMarca
                    ligada={m.feitas >= m.meta}
                    rotulo={`Registrar ${m.atividade.titulo} hoje`}
                    aoClicar={() => marcarOcorrencia(m.atividade.id, hoje, m.feitas >= m.meta ? null : 'feita')}
                  />
                  <span className="flex-1 font-bold">
                    {m.atividade.titulo} ({m.meta}x)
                  </span>
                  <span className="text-sm font-bold text-suave">
                    {Math.min(m.feitas, m.meta)}/{m.meta}
                  </span>
                </li>
              ))}
            </ul>
            <Link to="/tarefas?aba=metas" className="mt-3 inline-block text-sm font-bold text-titulo">
              Planejar a semana →
            </Link>
          </>
        )}
        <GatoPrancheta className="pointer-events-none absolute -bottom-3 right-0 h-28 w-28" />
      </section>

      {verAlertas && (
        <Folha titulo="Alertas" aoFechar={() => setVerAlertas(false)}>
          {totalAlertas === 0 ? (
            <p className="m-0 py-4 text-center text-suave">Nenhum alerta. Está tudo em dia, miau 🐾</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {al.conflitos.map((c, i) => (
                <li key={i} className="flex items-start gap-3 rounded-2xl bg-pessego/60 p-3 text-sm">
                  <AlertTriangle size={20} className="mt-0.5 shrink-0 text-titulo" />
                  <span>
                    <b>Conflito em {dataCurta(c.dia)}:</b> {c.a.atividade.titulo} ({c.a.hora}) e {c.b.atividade.titulo} ({c.b.hora}).
                  </span>
                </li>
              ))}
              {al.atrasadas.map((a) => (
                <li key={a.id} className="flex items-start gap-3 rounded-2xl bg-pessego/40 p-3 text-sm">
                  <Clock size={20} className="mt-0.5 shrink-0 text-titulo" />
                  <span>
                    <b>Passou do prazo:</b> {a.titulo} ({dataCurta((a.prazo ?? a.dia) as string)})
                  </span>
                </li>
              ))}
              {al.caixa.length > 0 && (
                <li className="flex items-start gap-3 rounded-2xl bg-lilas/50 p-3 text-sm">
                  <Inbox size={20} className="mt-0.5 shrink-0 text-titulo" />
                  <span>
                    <b>{al.caixa.length}</b> {al.caixa.length === 1 ? 'anotação' : 'anotações'} na Caixa de entrada.{' '}
                    <Link to="/tarefas?aba=caixa" onClick={() => setVerAlertas(false)} className="font-bold text-titulo">
                      Organizar
                    </Link>
                  </span>
                </li>
              )}
            </ul>
          )}
        </Folha>
      )}
    </div>
  )
}

function CartaoAreaGrande({ area, n }: { area: Area; n: number }) {
  const info = infoPadrao(area.chave)
  return (
    <Link
      to={`/area/${area.id}`}
      className={`cartao-area cor-${area.cor} relative flex min-h-[148px] flex-col items-center justify-between px-2 py-3 text-center no-underline`}
      style={{ color: 'inherit' }}
    >
      {n > 0 && <span className="selo absolute right-2 top-2" aria-label={`${n} pendências`}>{n}</span>}
      <Icone nome={nomeIconeArea(area)} size={48} strokeWidth={1.8} className="icone-forte mt-3" />
      <span>
        <span className="block font-display text-[15px] font-semibold leading-tight">{area.nome}</span>
        <span className="mt-1 block text-[11px] leading-tight text-suave">{info?.curto ?? 'Sua área'}</span>
      </span>
    </Link>
  )
}
