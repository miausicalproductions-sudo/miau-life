import type { Area, CorNome } from './tipos'

export interface AreaPadrao {
  chave: string
  nome: string
  icone: string
  cor: CorNome
  etapa: string
  resumo: string
}

export const AREAS_PADRAO: AreaPadrao[] = [
  { chave: 'estudos', nome: 'Estudos', icone: '📚', cor: 'lilas', etapa: 'Etapa 4', resumo: 'Cursos, aulas, provas, notas e certificados.' },
  { chave: 'trabalho', nome: 'Trabalho', icone: '💼', cor: 'rosa', etapa: 'Etapa 4', resumo: 'Empresas, clientes, projetos, entregas e reuniões.' },
  { chave: 'casa', nome: 'Casa', icone: '🏡', cor: 'pessego', etapa: 'Etapa 3', resumo: 'Cômodos, rotinas de limpeza e organização.' },
  { chave: 'pessoal', nome: 'Pessoal', icone: '🌸', cor: 'rosa', etapa: 'Etapa 3', resumo: 'Skincare, cabelo, unhas e hábitos.' },
  { chave: 'fit', nome: 'Fit & Saúde', icone: '🍓', cor: 'verde', etapa: 'Etapa 8', resumo: 'Medidas, treinos, receitas e água.' },
  { chave: 'pets', nome: 'Meus Pets', icone: '🐾', cor: 'pessego', etapa: 'Etapa 6', resumo: 'Perfis, vacinas, remédios e consultas.' },
  { chave: 'fazenda', nome: 'Fazenda', icone: '🌾', cor: 'verde', etapa: 'Etapa 9', resumo: 'Rebanho, produção, estoque e diário rural.' },
  { chave: 'financeiro', nome: 'Financeiro', icone: '💰', cor: 'lilas', etapa: 'Etapa 7', resumo: 'Receitas, contas, cartões e metas.' },
  { chave: 'viagens', nome: 'Viagens', icone: '✈️', cor: 'azul', etapa: 'Etapa 10', resumo: 'Roteiros, reservas, orçamento e memórias.' },
  { chave: 'projetos', nome: 'Projetos & Sonhos', icone: '✨', cor: 'amarelo', etapa: 'Etapa 10', resumo: 'Ideias, etapas, orçamento e progresso.' },
]

export function areasDeFabrica(): Omit<Area, 'id'>[] {
  return AREAS_PADRAO.map((a, i) => ({
    chave: a.chave,
    nome: a.nome,
    icone: a.icone,
    cor: a.cor,
    posicao: i,
    arquivada: false,
  }))
}

export function infoPadrao(chave: string) {
  return AREAS_PADRAO.find((a) => a.chave === chave)
}

export const CORES: { id: CorNome; nome: string }[] = [
  { id: 'rosa', nome: 'Rosa' },
  { id: 'lilas', nome: 'Lilás' },
  { id: 'verde', nome: 'Verde' },
  { id: 'pessego', nome: 'Pêssego' },
  { id: 'azul', nome: 'Azul' },
  { id: 'amarelo', nome: 'Amarelo' },
]

export const ICONES = ['📚', '💼', '🏡', '🌸', '🍓', '🐾', '🌾', '💰', '✈️', '✨', '🎀', '🧶', '🎨', '🎵', '📷', '🧴', '🍳', '🐄', '🐔', '🌱', '🛒', '💌', '🧹', '☕']
