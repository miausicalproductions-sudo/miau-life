import type { Cuidado } from './tipos'
import { diasEntre, somarDias } from './datas'

export type EstadoCuidado = 'nunca' | 'atrasado' | 'hoje' | 'em-dia'

export interface SituacaoCuidado {
  estado: EstadoCuidado
  /** atrasado: dias de atraso · em-dia: dias que faltam · demais: 0 */
  dias: number
  proxima: string | null
}

/** Quando o cuidado é devido e em que pé ele está hoje. */
export function situacao(c: Cuidado, hoje: string): SituacaoCuidado {
  if (!c.ultima_em) return { estado: 'nunca', dias: 0, proxima: null }
  const proxima = somarDias(c.ultima_em, c.frequencia_dias)
  const falta = diasEntre(hoje, proxima) // positivo = ainda falta
  if (falta < 0) return { estado: 'atrasado', dias: -falta, proxima }
  if (falta === 0) return { estado: 'hoje', dias: 0, proxima }
  return { estado: 'em-dia', dias: falta, proxima }
}

export const precisaDeCuidado = (c: Cuidado, hoje: string) => situacao(c, hoje).estado !== 'em-dia'

const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`

export function textoSituacao(s: SituacaoCuidado): string {
  switch (s.estado) {
    case 'nunca': return 'Sem registro'
    case 'hoje': return 'É hoje'
    case 'atrasado': return `Atrasado ${plural(s.dias, 'dia', 'dias')}`
    case 'em-dia': return s.dias === 1 ? 'Amanhã' : `Em ${s.dias} dias`
  }
}

export function textoFrequencia(d: number): string {
  if (d === 1) return 'todo dia'
  if (d === 7) return 'toda semana'
  if (d === 14) return 'a cada 2 semanas'
  if (d === 30) return 'todo mês'
  if (d % 7 === 0 && d < 60) return `a cada ${d / 7} semanas`
  return `a cada ${d} dias`
}

/** Ordem: mais atrasados primeiro, depois hoje, nunca feitos, e por fim os em dia (mais perto do prazo antes). */
export function ordenar(cs: Cuidado[], hoje: string): Cuidado[] {
  const peso = (c: Cuidado) => {
    const s = situacao(c, hoje)
    if (s.estado === 'atrasado') return -1000 - s.dias
    if (s.estado === 'hoje') return -500
    if (s.estado === 'nunca') return -100
    return s.dias
  }
  return [...cs].sort((a, b) => peso(a) - peso(b) || a.nome.localeCompare(b.nome, 'pt-BR'))
}

export function quantosPrecisam(cs: Cuidado[], areaId: string, hoje: string): number {
  // só conta o que venceu ou vence hoje; o que nunca foi registrado não infla o aviso do Início
  return cs.filter((c) => {
    if (!c.ativo || c.area_id !== areaId) return false
    const e = situacao(c, hoje).estado
    return e === 'atrasado' || e === 'hoje'
  }).length
}
