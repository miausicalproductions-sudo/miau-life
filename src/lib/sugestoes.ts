import type { NovoCuidado } from './tipos'

export interface ConfigCuidados {
  titulo: string
  vazio: string
  grupos: string[] // sugestões de grupo (cômodos / tipos de cuidado)
  sugestoes: Omit<NovoCuidado, 'area_id'>[]
}

const s = (grupo: string, nome: string, frequencia_dias: number) => ({ grupo, nome, frequencia_dias })

export const CUIDADOS_CASA: ConfigCuidados = {
  titulo: 'Limpeza e organização',
  vazio: 'Monte a rotina de cada cômodo. O Miau avisa quando algo estiver chegando na hora de fazer de novo.',
  grupos: ['Cozinha', 'Banheiro', 'Quarto', 'Sala', 'Área de serviço', 'Quintal'],
  sugestoes: [
    s('Cozinha', 'Lavar a pia e passar pano no fogão', 1),
    s('Cozinha', 'Limpar a geladeira por dentro', 30),
    s('Cozinha', 'Limpar o micro-ondas', 15),
    s('Cozinha', 'Lavar a lixeira', 7),
    s('Banheiro', 'Limpar vaso e pia', 3),
    s('Banheiro', 'Lavar o box e o chão', 7),
    s('Banheiro', 'Trocar as toalhas', 7),
    s('Quarto', 'Trocar a roupa de cama', 7),
    s('Quarto', 'Aspirar ou varrer o chão', 3),
    s('Quarto', 'Organizar o guarda-roupa', 90),
    s('Sala', 'Tirar o pó dos móveis', 7),
    s('Sala', 'Aspirar sofá e tapete', 15),
    s('Área de serviço', 'Lavar roupa', 3),
    s('Área de serviço', 'Limpar o ralo e o tanque', 30),
    s('Quintal', 'Varrer e regar as plantas', 3),
  ],
}

export const CUIDADOS_PESSOAL: ConfigCuidados = {
  titulo: 'Autocuidado',
  vazio: 'Skincare, cabelo, unhas e corpo num só lugar. O Miau lembra de cada um no tempo certo.',
  grupos: ['Skincare', 'Cabelo', 'Unhas', 'Corpo'],
  sugestoes: [
    s('Skincare', 'Esfoliação facial', 7),
    s('Skincare', 'Máscara facial', 7),
    s('Skincare', 'Limpeza de pele profunda', 30),
    s('Cabelo', 'Hidratação', 7),
    s('Cabelo', 'Nutrição', 15),
    s('Cabelo', 'Reconstrução', 30),
    s('Cabelo', 'Corte ou pontas', 90),
    s('Unhas', 'Manicure', 14),
    s('Unhas', 'Pedicure', 21),
    s('Corpo', 'Esfoliação corporal', 7),
    s('Corpo', 'Depilação', 21),
    s('Corpo', 'Hidratação do corpo', 3),
  ],
}

export function configDaArea(chave: string): ConfigCuidados | null {
  if (chave === 'casa') return CUIDADOS_CASA
  if (chave === 'pessoal') return CUIDADOS_PESSOAL
  return null
}
