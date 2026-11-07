export type CorNome = 'rosa' | 'lilas' | 'verde' | 'pessego' | 'azul' | 'amarelo'

export interface Area {
  id: string
  chave: string // identifica as áreas "de fábrica"; áreas criadas por você usam "personalizada"
  nome: string
  icone: string // nome de um ícone SVG (veja lib/icones.tsx)
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
  descricao: string | null
  tipo: TipoAtividade
  status: 'pendente' | 'feita' | 'arquivada'
  prioridade: 'normal' | 'alta'
  inicio: string | null // data e hora de início (compromisso / agendada com hora)
  fim: string | null
  dia: string | null // YYYY-MM-DD (compromisso e tarefa agendada)
  prazo: string | null // YYYY-MM-DD (tarefa com prazo)
  meta_semana: number | null // tarefa flexível: vezes por semana
  dias_semana: number[] | null // rotina: 0=Dom ... 6=Sáb (null = todo dia)
  local: string | null
  endereco: string | null
  lembrete_min: number | null
  concluida_em: string | null
  excluida_em: string | null // lixeira
  created_at: string
}

export type NovaAtividade = Partial<Omit<Atividade, 'id' | 'created_at'>> & { titulo: string; tipo: TipoAtividade }

/** Cada vez que uma meta flexível ou rotina é planejada (feito=false) ou feita (feito=true) num dia */
export interface Ocorrencia {
  id: string
  atividade_id: string
  dia: string
  feito: boolean
  feito_em: string | null
  created_at: string
}

export type EstadoOcorrencia = 'planejada' | 'feita' | null

/** Um cuidado que se repete: limpar a geladeira a cada 30 dias, hidratação a cada 7... */
export interface Cuidado {
  id: string
  area_id: string | null
  grupo: string // cômodo (Casa) ou tipo de cuidado (Pessoal)
  nome: string
  frequencia_dias: number
  ultima_em: string | null // YYYY-MM-DD da última vez
  anterior_em: string | null // guarda o valor anterior para poder desfazer
  ativo: boolean
  created_at: string
}
export type NovoCuidado = Pick<Cuidado, 'nome' | 'grupo' | 'frequencia_dias'> & Partial<Pick<Cuidado, 'area_id' | 'ultima_em'>>

export interface ItemLista {
  id: string
  area_id: string | null
  nome: string
  feito: boolean
  created_at: string
}
