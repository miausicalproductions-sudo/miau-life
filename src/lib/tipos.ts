export type CorNome = 'rosa' | 'lilas' | 'verde' | 'pessego' | 'azul' | 'amarelo'

export interface Area {
  id: string
  chave: string // identifica as áreas "de fábrica"; áreas criadas por você usam "personalizada"
  nome: string
  icone: string
  cor: CorNome
  posicao: number
  arquivada: boolean
}

/** Os 4 tipos do "motor de atividades" + rotina diária + caixa de entrada */
export type TipoAtividade = 'compromisso' | 'prazo' | 'agendada' | 'flexivel' | 'rotina' | 'caixa'

export interface Atividade {
  id: string
  area_id: string | null
  titulo: string
  tipo: TipoAtividade
  status: 'pendente' | 'feita' | 'arquivada'
  dia: string | null // YYYY-MM-DD (tarefa agendada)
  prazo: string | null // YYYY-MM-DD (tarefa com prazo)
  inicio: string | null // data e hora (compromisso)
  created_at: string
}
