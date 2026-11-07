import { useCallback } from 'react'
import { Check, MapPin, Repeat, Target, CalendarClock, Clock, Star } from 'lucide-react'
import { useApp } from '../lib/ContextoApp'
import { Icone, nomeIconeArea } from '../lib/icones'
import type { ItemDia } from '../lib/agenda'
import { dataCurta } from '../lib/datas'

/** Marca ou desmarca um item como feito, do jeito certo para cada tipo. */
export function useAlternar() {
  const { atualizar, marcarOcorrencia } = useApp()
  return useCallback(
    (i: ItemDia) => {
      const a = i.atividade
      if (i.categoria === 'flexivel') return marcarOcorrencia(a.id, i.dia, i.feito ? 'planejada' : 'feita')
      if (i.categoria === 'rotina') return marcarOcorrencia(a.id, i.dia, i.feito ? null : 'feita')
      return atualizar(a.id, i.feito ? { status: 'pendente', concluida_em: null } : { status: 'feita', concluida_em: new Date().toISOString() })
    },
    [atualizar, marcarOcorrencia],
  )
}

export function CaixaMarca({ ligada, aoClicar, rotulo }: { ligada: boolean; aoClicar: () => void; rotulo: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={ligada}
      aria-label={rotulo}
      data-on={ligada}
      onClick={(e) => {
        e.stopPropagation()
        aoClicar()
      }}
      className="caixa-marca"
    >
      {ligada && <Check size={17} strokeWidth={3.5} />}
    </button>
  )
}

const ROTULO: Record<ItemDia['categoria'], string | null> = {
  presenca: 'Presença obrigatória',
  agendada: null,
  prazo: 'Prazo',
  flexivel: 'Meta da semana',
  rotina: null,
}

export default function ItemCartao({ item, mostrarData = false, aoAbrir }: { item: ItemDia; mostrarData?: boolean; aoAbrir: () => void }) {
  const { areas } = useApp()
  const alternar = useAlternar()
  const a = item.atividade
  const area = areas.find((x) => x.id === a.area_id)
  const presenca = item.categoria === 'presenca'
  const selo = ROTULO[item.categoria]

  const SeloIcone = presenca ? MapPin : item.categoria === 'prazo' ? CalendarClock : item.categoria === 'flexivel' ? Target : Repeat

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={aoAbrir}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && aoAbrir()}
      className={`cartao cor-${area?.cor ?? 'rosa'} flex cursor-pointer items-center gap-3 p-3 ${item.feito ? 'opacity-60' : ''}`}
    >
      <span className="bolinha icone-forte grid h-11 w-11 shrink-0 place-items-center rounded-2xl">
        {area ? <Icone nome={nomeIconeArea(area)} size={22} /> : <Icone nome="star" size={22} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className={`flex items-center gap-1 font-extrabold leading-tight ${item.feito ? 'line-through' : ''}`}>
          <span className="break-words">{a.titulo}</span>
          {a.prioridade === 'alta' && <Star size={15} className="shrink-0 fill-amber-300 text-amber-400" aria-label="Importante" />}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-suave">
          {mostrarData && <span>{dataCurta(item.dia)}</span>}
          {item.hora && (
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {item.hora}
              {item.horaFim ? `–${item.horaFim}` : ''}
            </span>
          )}
          {a.local && (
            <span className="inline-flex items-center gap-1 truncate">
              <MapPin size={12} />
              {a.local}
            </span>
          )}
          {!a.local && area && <span>{area.nome}</span>}
        </div>
        {selo && (
          <span
            className="mt-1.5 inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-extrabold text-white"
            style={{ background: presenca ? 'var(--cf-presenca)' : 'var(--forte)' }}
          >
            <SeloIcone size={12} />
            {selo}
          </span>
        )}
      </div>
      <CaixaMarca ligada={item.feito} aoClicar={() => alternar(item)} rotulo={item.feito ? `Desmarcar ${a.titulo}` : `Concluir ${a.titulo}`} />
    </div>
  )
}
