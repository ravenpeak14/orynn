import { createElement } from 'react'
import { categoryIcon, colorStyle } from '../lib/categories'
import { cn } from '../lib/cn'
import type { Category } from '../types/api'

export function CategoryIcon({ icon, className }: { icon: string | null; className?: string }) {
  return createElement(categoryIcon(icon), { className, 'aria-hidden': true })
}

export function CategoryBadge({ category }: { category: Category }) {
  const style = colorStyle(category.color)

  return (
    <span className={cn('inline-flex h-6 items-center gap-1 rounded-full px-2 text-[12px] font-medium', style.soft, style.ink)}>
      <CategoryIcon icon={category.icon} className="size-3.5" />
      {category.name}
    </span>
  )
}
