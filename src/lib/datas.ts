// Datas sempre no fuso do aparelho, no formato YYYY-MM-DD. A semana começa na segunda.

export const iso = (d: Date) => d.toLocaleDateString('sv-SE')
export const hojeISO = () => iso(new Date())

export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export function somarDias(s: string, n: number): string {
  const d = parseISO(s)
  d.setDate(d.getDate() + n)
  return iso(d)
}
export function inicioSemana(s: string): string {
  const d = parseISO(s)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return iso(d)
}
export function diasDaSemana(s: string): string[] {
  const i = inicioSemana(s)
  return Array.from({ length: 7 }, (_, k) => somarDias(i, k))
}
/** Todos os dias que aparecem na grade do mês (semanas completas, segunda a domingo). */
export function gradeDoMes(ano: number, mes0: number): string[] {
  const inicio = inicioSemana(iso(new Date(ano, mes0, 1)))
  const fim = somarDias(inicioSemana(iso(new Date(ano, mes0 + 1, 0))), 6)
  const out: string[] = []
  for (let d = inicio; d <= fim; d = somarDias(d, 1)) out.push(d)
  return out
}

export function hhmm(ts: string): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
/** Junta o dia (YYYY-MM-DD) com a hora (HH:MM) e devolve um instante em formato ISO. */
export function combinar(dia: string, hora: string): string {
  return new Date(`${dia}T${hora}:00`).toISOString()
}

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
export const SEMANA_SEG = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
export const nomeDiaCurto = (s: string) => DIAS[parseISO(s).getDay()]
export const nomeMes = (m0: number) => MESES[m0]
export const dataLonga = (s: string) => {
  const d = parseISO(s)
  return `${DIAS[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} de ${MESES[d.getMonth()].toLowerCase()}`
}
export const dataCurta = (s: string) => {
  const d = parseISO(s)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}
