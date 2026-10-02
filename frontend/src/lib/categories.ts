import {
  Activity,
  BookOpen,
  Briefcase,
  Circle,
  Code,
  Coffee,
  Dumbbell,
  GraduationCap,
  Heart,
  House,
  type LucideIcon,
  Music,
  Plane,
  ShoppingCart,
  Sparkles,
  Users,
} from 'lucide-react'
import type { CategoryColor } from '../types/api'

/** Icon identifiers stored in categories.icon. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  dumbbell: Dumbbell,
  'graduation-cap': GraduationCap,
  'book-open': BookOpen,
  briefcase: Briefcase,
  code: Code,
  heart: Heart,
  users: Users,
  house: House,
  coffee: Coffee,
  music: Music,
  plane: Plane,
  'shopping-cart': ShoppingCart,
  sparkles: Sparkles,
  circle: Circle,
}

export function categoryIcon(name: string | null | undefined): LucideIcon {
  return (name && CATEGORY_ICONS[name]) || Circle
}

export const CATEGORY_COLORS: CategoryColor[] = ['green', 'blue', 'orange', 'purple', 'pink', 'teal', 'yellow', 'red', 'gray']

interface ColorStyle {
  dot: string
  soft: string
  ink: string
  border: string
}

// Full class names so Tailwind can find them in the source.
const COLOR_STYLES: Record<CategoryColor, ColorStyle> = {
  green: { dot: 'bg-cat-green', soft: 'bg-cat-green-soft', ink: 'text-cat-green-ink', border: 'border-cat-green' },
  blue: { dot: 'bg-cat-blue', soft: 'bg-cat-blue-soft', ink: 'text-cat-blue-ink', border: 'border-cat-blue' },
  orange: { dot: 'bg-cat-orange', soft: 'bg-cat-orange-soft', ink: 'text-cat-orange-ink', border: 'border-cat-orange' },
  purple: { dot: 'bg-cat-purple', soft: 'bg-cat-purple-soft', ink: 'text-cat-purple-ink', border: 'border-cat-purple' },
  pink: { dot: 'bg-cat-pink', soft: 'bg-cat-pink-soft', ink: 'text-cat-pink-ink', border: 'border-cat-pink' },
  teal: { dot: 'bg-cat-teal', soft: 'bg-cat-teal-soft', ink: 'text-cat-teal-ink', border: 'border-cat-teal' },
  yellow: { dot: 'bg-cat-yellow', soft: 'bg-cat-yellow-soft', ink: 'text-cat-yellow-ink', border: 'border-cat-yellow' },
  red: { dot: 'bg-cat-red', soft: 'bg-cat-red-soft', ink: 'text-cat-red-ink', border: 'border-cat-red' },
  gray: { dot: 'bg-cat-gray', soft: 'bg-cat-gray-soft', ink: 'text-cat-gray-ink', border: 'border-cat-gray' },
}

export function colorStyle(color: CategoryColor | null | undefined): ColorStyle {
  return COLOR_STYLES[color ?? 'gray'] ?? COLOR_STYLES.gray
}
