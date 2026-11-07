// Regras do "motor de atividades": o que aparece em cada dia, conflitos, metas e alertas.
// São funções puras (só recebem dados e devolvem resultado), por isso são fáceis de testar.
import type { Atividade, Ocorrencia } from './tipos'
import { diasDaSemana, hhmm, inicioSemana, parseISO, somarDias } from './datas'

export type CategoriaItem = 'presenca' | 'agendada' | 'prazo' | 'flexivel' | 'rotina'

export interface ItemDia {
  chave: string
  atividade: Atividade
  categoria: CategoriaItem
  dia: string
  hora: string | null // "15:00"
  horaFim: string | null
  inicioMs: number | null
  fimMs: number | null
  feito: boolean
  planejada: boolean // meta flexível que você já programou para este dia
}

const UMA_HORA = 3600000

export const ativa = (a: Atividade) => !a.excluida_em && a.status !== 'arquivada'

export function itensDoDia(dia: string, atividades: Atividade[], ocorrencias: Ocorrencia[]): ItemDia[] {
  const out: ItemDia[] = []
  const dow = parseISO(dia).getDay()

  for (const a of atividades) {
    if (!ativa(a)) continue
    const base = { atividade: a, dia, hora: null, horaFim: null, inicioMs: null, fimMs: null, planejada: false }

    if ((a.tipo === 'compromisso' || a.tipo === 'agendada') && a.dia === dia) {
      const inicioMs = a.inicio ? Date.parse(a.inicio) : null
      const fimMs = inicioMs === null ? null : a.fim ? Date.parse(a.fim) : inicioMs + UMA_HORA
      out.push({
        ...base,
        chave: a.id,
        categoria: a.tipo === 'compromisso' ? 'presenca' : 'agendada',
        hora: a.inicio ? hhmm(a.inicio) : null,
        horaFim: a.fim ? hhmm(a.fim) : null,
        inicioMs,
        fimMs,
        feito: a.status === 'feita',
      })
    } else if (a.tipo === 'prazo' && a.prazo === dia) {
      out.push({ ...base, chave: a.id, categoria: 'prazo', feito: a.status === 'feita' })
    } else if (a.tipo === 'flexivel') {
      const o = ocorrencias.find((x) => x.atividade_id === a.id && x.dia === dia)
      if (o) out.push({ ...base, chave: `${a.id}:${dia}`, categoria: 'flexivel', feito: o.feito, planejada: !o.feito })
    } else if (a.tipo === 'rotina') {
      const dias = a.dias_semana
      if (!dias || dias.length === 0 || dias.includes(dow)) {
        const o = ocorrencias.find((x) => x.atividade_id === a.id && x.dia === dia)
        out.push({ ...base, chave: `${a.id}:${dia}`, categoria: 'rotina', feito: !!o?.feito })
      }
    }
  }

  return out.sort((x, y) => {
    if (x.inicioMs !== null && y.inicioMs !== null) return x.inicioMs - y.inicioMs
    if (x.inicioMs !== null) return -1
    if (y.inicioMs !== null) return 1
    const px = x.atividade.prioridade === 'alta' ? 0 : 1
    const py = y.atividade.prioridade === 'alta' ? 0 : 1
    return px - py || x.atividade.titulo.localeCompare(y.atividade.titulo, 'pt-BR')
  })
}

export interface Conflito {
  dia: string
  a: ItemDia
  b: ItemDia
}

/** Dois itens com horário que se sobrepõem no mesmo dia (itens já feitos não contam). */
export function conflitosDoDia(itens: ItemDia[]): Conflito[] {
  const comHora = itens.filter((i) => i.inicioMs !== null && i.fimMs !== null && !i.feito)
  const out: Conflito[] = []
  for (let i = 0; i < comHora.length; i++) {
    for (let j = i + 1; j < comHora.length; j++) {
      const a = comHora[i]
      const b = comHora[j]
      if (a.inicioMs! < b.fimMs! && b.inicioMs! < a.fimMs!) out.push({ dia: a.dia, a, b })
    }
  }
  return out
}

export function proximosConflitos(hoje: string, dias: number, atividades: Atividade[], ocorrencias: Ocorrencia[]): Conflito[] {
  const out: Conflito[] = []
  for (let k = 0; k < dias; k++) {
    const d = somarDias(hoje, k)
    out.push(...conflitosDoDia(itensDoDia(d, atividades, ocorrencias)))
  }
  return out
}

export interface MetaSemana {
  atividade: Atividade
  meta: number
  feitas: number
  planejadas: number
}

export function metasDaSemana(dia: string, atividades: Atividade[], ocorrencias: Ocorrencia[]): { metas: MetaSemana[]; percentual: number } {
  const semana = new Set(diasDaSemana(dia))
  const metas: MetaSemana[] = atividades
    .filter((a) => ativa(a) && a.tipo === 'flexivel' && (a.meta_semana ?? 0) > 0)
    .map((a) => {
      const deles = ocorrencias.filter((o) => o.atividade_id === a.id && semana.has(o.dia))
      return {
        atividade: a,
        meta: a.meta_semana as number,
        feitas: deles.filter((o) => o.feito).length,
        planejadas: deles.filter((o) => !o.feito).length,
      }
    })
  const total = metas.reduce((s, m) => s + m.meta, 0)
  const feitas = metas.reduce((s, m) => s + Math.min(m.feitas, m.meta), 0)
  return { metas, percentual: total === 0 ? 0 : Math.round((feitas / total) * 100) }
}

export interface Alertas {
  atrasadas: Atividade[]
  conflitos: Conflito[]
  caixa: Atividade[]
}

export function alertas(hoje: string, atividades: Atividade[], ocorrencias: Ocorrencia[]): Alertas {
  const vivas = atividades.filter(ativa)
  const atrasadas = vivas.filter(
    (a) =>
      a.status === 'pendente' &&
      ((a.tipo === 'prazo' && a.prazo !== null && a.prazo < hoje) ||
        ((a.tipo === 'agendada' || a.tipo === 'compromisso') && a.dia !== null && a.dia < hoje)),
  )
  return {
    atrasadas,
    conflitos: proximosConflitos(hoje, 14, atividades, ocorrencias),
    caixa: vivas.filter((a) => a.tipo === 'caixa' && a.status === 'pendente'),
  }
}

/** Quantas pendências "pedem atenção" numa área: tarefas pendentes e metas da semana ainda não cumpridas. */
export function pendenciasDaArea(areaId: string, hoje: string, atividades: Atividade[], ocorrencias: Ocorrencia[]): number {
  const { metas } = metasDaSemana(hoje, atividades, ocorrencias)
  const nasMetas = metas.filter((m) => m.atividade.area_id === areaId && m.feitas < m.meta).length
  const tarefas = atividades.filter(
    (a) =>
      ativa(a) &&
      a.area_id === areaId &&
      a.status === 'pendente' &&
      (a.tipo === 'prazo' || a.tipo === 'agendada' || a.tipo === 'compromisso'),
  ).length
  return nasMetas + tarefas
}

/** Quantas coisas foram concluídas em cada uma das últimas semanas (para a tela Evolução). */
export function concluidasPorSemana(hoje: string, semanas: number, atividades: Atividade[], ocorrencias: Ocorrencia[]): { inicio: string; total: number }[] {
  const atual = inicioSemana(hoje)
  const out: { inicio: string; total: number }[] = []
  for (let k = semanas - 1; k >= 0; k--) {
    const inicio = somarDias(atual, -7 * k)
    const fim = somarDias(inicio, 6)
    const dentro = (d: string) => d >= inicio && d <= fim
    const tarefas = atividades.filter((a) => a.concluida_em && dentro(new Date(a.concluida_em).toLocaleDateString('sv-SE'))).length
    const ocs = ocorrencias.filter((o) => o.feito && dentro(o.dia)).length
    out.push({ inicio, total: tarefas + ocs })
  }
  return out
}
