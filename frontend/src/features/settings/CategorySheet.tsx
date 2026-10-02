import { Check, Trash2 } from 'lucide-react'
import { createElement, type FormEvent, useId, useState } from 'react'
import { Sheet } from '../../components/Sheet'
import { Button, ConfirmButton, Field, FormError } from '../../components/ui'
import { ApiError } from '../../lib/api'
import { CATEGORY_COLORS, CATEGORY_ICONS, colorStyle } from '../../lib/categories'
import { cn } from '../../lib/cn'
import { inputClass } from '../../lib/styles'
import type { Category, CategoryInput } from '../../types/api'
import { useDeleteCategory, useSaveCategory } from '../categories/api'

interface CategorySheetProps {
  category?: Category
  onClose: () => void
}

export function CategorySheet({ category, onClose }: CategorySheetProps) {
  const formId = useId()
  const colorLabel = useId()
  const iconLabel = useId()
  const save = useSaveCategory()
  const remove = useDeleteCategory()

  const [form, setForm] = useState<CategoryInput>({
    name: category?.name ?? '',
    color: category?.color ?? 'purple',
    icon: category?.icon ?? 'circle',
  })
  const [error, setError] = useState<unknown>(null)
  const fieldError = (name: string) => (error instanceof ApiError ? error.field(name) : undefined)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      await save.mutateAsync({ id: category?.id, input: { ...form, name: form.name.trim() } })
      onClose()
    } catch (caught) {
      setError(caught)
    }
  }

  async function destroy() {
    if (!category) return
    try {
      await remove.mutateAsync(category.id)
      onClose()
    } catch (caught) {
      setError(caught)
    }
  }

  return (
    <Sheet
      title={category ? 'Edit category' : 'New category'}
      onClose={onClose}
      footer={
        <Button type="submit" form={formId} size="lg" loading={save.isPending} className="w-full">
          Save Category
        </Button>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="space-y-5">
        <Field label="Name" error={fieldError('name')}>
          {(control) => (
            <input
              {...control}
              autoFocus={!category}
              maxLength={100}
              placeholder="e.g. Music"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className={inputClass}
            />
          )}
        </Field>

        <div className="space-y-1.5">
          <p id={colorLabel} className="text-[13px] font-medium text-ink-muted">
            Color
          </p>
          <div role="group" aria-labelledby={colorLabel} className="flex flex-wrap gap-2.5">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={color}
                aria-pressed={form.color === color}
                onClick={() => setForm({ ...form, color })}
                className={cn(
                  'flex size-10 items-center justify-center rounded-full text-white ring-offset-2 ring-offset-white transition',
                  colorStyle(color).dot,
                  form.color === color && 'ring-2 ring-ink',
                )}
              >
                {form.color === color && <Check className="size-4" strokeWidth={3} aria-hidden />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p id={iconLabel} className="text-[13px] font-medium text-ink-muted">
            Icon
          </p>
          <div role="group" aria-labelledby={iconLabel} className="grid grid-cols-5 gap-2">
            {Object.entries(CATEGORY_ICONS).map(([name, icon]) => (
              <button
                key={name}
                type="button"
                aria-label={name.replaceAll('-', ' ')}
                aria-pressed={form.icon === name}
                onClick={() => setForm({ ...form, icon: name })}
                className={cn(
                  'flex h-12 items-center justify-center rounded-md border transition',
                  form.icon === name
                    ? cn('border-transparent', colorStyle(form.color).soft, colorStyle(form.color).ink)
                    : 'border-line bg-white text-ink-muted hover:bg-black/[0.03]',
                )}
              >
                {createElement(icon, { className: 'size-5', 'aria-hidden': true })}
              </button>
            ))}
          </div>
        </div>

        <FormError error={error} fields={['name']} />

        {category && (
          <div className="border-t border-line pt-5">
            <ConfirmButton icon={<Trash2 />} loading={remove.isPending} onConfirm={destroy} className="w-full">
              Delete category
            </ConfirmButton>
            <p className="mt-2 text-center text-[13px] text-ink-muted">Schedules using it are kept, without a category.</p>
          </div>
        )}
      </form>
    </Sheet>
  )
}
