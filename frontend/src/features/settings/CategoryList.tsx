import { ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { CategoryIcon } from '../../components/CategoryBadge'
import { Notice } from '../../components/ui'
import { colorStyle } from '../../lib/categories'
import { cn } from '../../lib/cn'
import { useCategories } from '../categories/api'
import { CategorySheet } from './CategorySheet'

type Editor = { type: 'create' } | { type: 'edit'; id: number } | null

export function CategoryList() {
  const categories = useCategories()
  const [editor, setEditor] = useState<Editor>(null)
  const editing = editor?.type === 'edit' ? categories.data?.find((category) => category.id === editor.id) : undefined

  if (categories.isError) return <Notice>{categories.error.message}</Notice>

  return (
    <>
      <ul className="-mx-2">
        {(categories.data ?? []).map((category) => {
          const style = colorStyle(category.color)
          return (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => setEditor({ type: 'edit', id: category.id })}
                className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition hover:bg-black/[0.03]"
              >
                <span className={cn('flex size-9 items-center justify-center rounded-full', style.soft, style.ink)}>
                  <CategoryIcon icon={category.icon} className="size-4.5" />
                </span>
                <span className="flex-1 truncate text-[15px] font-medium">{category.name}</span>
                <ChevronRight className="size-4 text-ink-muted" aria-hidden />
              </button>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={() => setEditor({ type: 'create' })}
            className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left text-[15px] font-semibold text-accent-strong transition hover:bg-accent-soft/60"
          >
            <span className="flex size-9 items-center justify-center rounded-full border border-dashed border-accent/50">
              <Plus className="size-4.5" aria-hidden />
            </span>
            Add category
          </button>
        </li>
      </ul>

      {editor?.type === 'create' && <CategorySheet onClose={() => setEditor(null)} />}
      {editing && <CategorySheet key={editing.id} category={editing} onClose={() => setEditor(null)} />}
    </>
  )
}
