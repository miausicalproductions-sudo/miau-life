import type { ComponentType } from 'react'
import {
  BookOpen, Bone, Bed, Brush, Briefcase, Camera, Coffee, Coins, Droplets, Dumbbell, Egg, Flower2, Gift,
  GraduationCap, Heart, House, Laptop, Mail, Milk, Music, Palette, PawPrint, Plane, Scissors, ShoppingCart,
  Shirt, Sparkles, Sprout, Star, Tractor, Utensils, Wheat,
} from 'lucide-react'

type Ic = ComponentType<{ size?: number; strokeWidth?: number; className?: string; 'aria-hidden'?: boolean }>

// Ícones SVG que você pode escolher para cada área.
const MAPA: Record<string, Ic> = {
  'graduation-cap': GraduationCap,
  laptop: Laptop,
  house: House,
  heart: Heart,
  dumbbell: Dumbbell,
  'paw-print': PawPrint,
  tractor: Tractor,
  coins: Coins,
  plane: Plane,
  sparkles: Sparkles,
  'book-open': BookOpen,
  briefcase: Briefcase,
  flower: Flower2,
  camera: Camera,
  music: Music,
  palette: Palette,
  'shopping-cart': ShoppingCart,
  mail: Mail,
  brush: Brush,
  coffee: Coffee,
  milk: Milk,
  egg: Egg,
  sprout: Sprout,
  wheat: Wheat,
  utensils: Utensils,
  shirt: Shirt,
  bed: Bed,
  droplets: Droplets,
  scissors: Scissors,
  bone: Bone,
  star: Star,
  gift: Gift,
}

export const NOMES_ICONES = Object.keys(MAPA)

const PADRAO_POR_CHAVE: Record<string, string> = {
  estudos: 'graduation-cap',
  trabalho: 'laptop',
  casa: 'house',
  pessoal: 'heart',
  fit: 'dumbbell',
  pets: 'paw-print',
  fazenda: 'tractor',
  financeiro: 'coins',
  viagens: 'plane',
  projetos: 'sparkles',
}

/** Áreas antigas guardavam um emoji; aqui ele vira o ícone SVG correspondente. */
export function nomeIconeArea(a: { icone: string; chave: string }): string {
  return MAPA[a.icone] ? a.icone : (PADRAO_POR_CHAVE[a.chave] ?? 'star')
}

export function Icone({ nome, size = 24, strokeWidth = 2, className }: { nome: string; size?: number; strokeWidth?: number; className?: string }) {
  const C = MAPA[nome] ?? Star
  return <C size={size} strokeWidth={strokeWidth} className={className} aria-hidden />
}
