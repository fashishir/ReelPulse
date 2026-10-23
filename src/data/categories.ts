import type { LucideIcon } from 'lucide-react'
import {
  Cpu,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  Landmark,
  Laugh,
  Music4,
  Plane,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import type { CategoryFilter, CategoryId } from '../types'

export interface CategoryMeta {
  id: CategoryId
  label: string
  shortLabel: string
  icon: LucideIcon
  accent: string
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'comedy', label: 'Comedy & Memes', shortLabel: 'Comedy', icon: Laugh, accent: '#FBBF24' },
  { id: 'tech', label: 'Tech & AI', shortLabel: 'Tech & AI', icon: Cpu, accent: '#38BDF8' },
  {
    id: 'fitness',
    label: 'Fitness & Health',
    shortLabel: 'Fitness',
    icon: Dumbbell,
    accent: '#34D399',
  },
  {
    id: 'food',
    label: 'Food & Cooking',
    shortLabel: 'Food',
    icon: UtensilsCrossed,
    accent: '#FB923C',
  },
  {
    id: 'fashion',
    label: 'Fashion & Beauty',
    shortLabel: 'Fashion',
    icon: Sparkles,
    accent: '#F472B6',
  },
  { id: 'travel', label: 'Travel', shortLabel: 'Travel', icon: Plane, accent: '#22D3EE' },
  { id: 'gaming', label: 'Gaming', shortLabel: 'Gaming', icon: Gamepad2, accent: '#A78BFA' },
  {
    id: 'finance',
    label: 'Finance & Business',
    shortLabel: 'Finance',
    icon: Landmark,
    accent: '#A3E635',
  },
  { id: 'music', label: 'Music & Dance', shortLabel: 'Music', icon: Music4, accent: '#E879F9' },
  {
    id: 'education',
    label: 'Education',
    shortLabel: 'Education',
    icon: GraduationCap,
    accent: '#60A5FA',
  },
]

export const CATEGORY_MAP: Record<CategoryId, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category]),
) as Record<CategoryId, CategoryMeta>

export function categoryMeta(id: CategoryId): CategoryMeta {
  return CATEGORY_MAP[id]
}

export function categoryAccent(id: CategoryId): string {
  return CATEGORY_MAP[id].accent
}

export function categoryLabel(filter: CategoryFilter): string {
  return filter === 'all' ? 'All categories' : CATEGORY_MAP[filter].label
}


