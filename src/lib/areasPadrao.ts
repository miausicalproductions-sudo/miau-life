import type { Area, CorNome } from './tipos'

export interface AreaPadrao {
  chave: string
  nome: string
  icone: string
  cor: CorNome
  etapa: string
  resumo: string
  curto: string
}

export const AREAS_PADRAO: AreaPadrao[] = [
  { chave: 'estudos', nome: 'Estudos', icone: 'graduation-cap', cor: 'lilas', etapa: 'Etapa 4', resumo: 'Cursos, aulas, provas, notas e certificados.', curto: 'Provas, aulas e trabalhos' },
  { chave: 'trabalho', nome: 'Trabalho', icone: 'laptop', cor: 'azul', etapa: 'Etapa 4', resumo: 'Empresas, clientes, projetos, entregas e reuniões.', curto: 'Entregas, conteúdos e clientes' },
  { chave: 'casa', nome: 'Casa & Organização', icone: 'house', cor: 'pessego', etapa: 'Etapa 3', resumo: 'Cômodos, rotinas de limpeza e organização.', curto: 'Limpeza, rotinas e casa' },
  { chave: 'fit', nome: 'Vida Fit', icone: 'dumbbell', cor: 'lilas', etapa: 'Etapa 8', resumo: 'Medidas, treinos, receitas e água.', curto: 'Academia, meta semanal e saúde' },
  { chave: 'pessoal', nome: 'Pessoal', icone: 'heart', cor: 'rosa', etapa: 'Etapa 3', resumo: 'Skincare, cabelo, unhas e hábitos.', curto: 'Autocuidado, skincare e beleza' },
  { chave: 'pets', nome: 'Pets', icone: 'paw-print', cor: 'pessego', etapa: 'Etapa 6', resumo: 'Perfis, vacinas, remédios e consultas.', curto: 'Cuidados, banho, vacinas e remédios' },
  { chave: 'fazenda', nome: 'Fazenda & Rural', icone: 'tractor', cor: 'amarelo', etapa: 'Etapa 9', resumo: 'Rebanho, produção, estoque e diário rural.', curto: 'Rebanho, produção e estoque' },
  { chave: 'financeiro', nome: 'Financeiro', icone: 'coins', cor: 'amarelo', etapa: 'Etapa 7', resumo: 'Receitas, contas, cartões e metas.', curto: 'Contas, cartões e metas' },
  { chave: 'viagens', nome: 'Viagens', icone: 'plane', cor: 'lilas', etapa: 'Etapa 10', resumo: 'Roteiros, reservas, orçamento e memórias.', curto: 'Roteiros e reservas' },
  { chave: 'projetos', nome: 'Projetos & Sonhos', icone: 'sparkles', cor: 'rosa', etapa: 'Etapa 10', resumo: 'Ideias, etapas, orçamento e progresso.', curto: 'Ideias, etapas e progresso' },
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
