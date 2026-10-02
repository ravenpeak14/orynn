import { Trash2 } from 'lucide-react'
import { type FormEvent, useId, useState } from 'react'
import { Sheet } from '../../components/Sheet'
import { Button, ChoiceChips, ConfirmButton, Field, FormError, Switch } from '../../components/ui'
import { ApiError } from '../../lib/api'
import { WEEKDAYS } from '../../lib/date'
import { inputClass, textareaClass } from '../../lib/styles'
import type { ScheduleTemplate, TemplateInput } from '../../types/api'
import { CategoryField, ReminderField, TimeRangeFields } from '../schedules/fields'
import { useDeleteTemplate, useSaveTemplate } from './api'

interface TemplateSheetProps {
  template?: ScheduleTemplate
  defaultDay: number
  onClose: () => void
}

interface FormState extends Omit<TemplateInput, 'description'> {
  description: string
}

const SHOWN_FIELDS = ['title', 'day_of_week', 'start_time', 'end_time', 'category_id', 'reminder_minutes', 'description']

const DAY_OPTIONS = WEEKDAYS.map((day) => ({ value: day.value, label: day.short, ariaLabel: day.long }))

/** Create or edit a recurring routine. Changes apply to every matching week. */
export function TemplateSheet({ template, defaultDay, onClose }: TemplateSheetProps) {
  const formId = useId()
  const save = useSaveTemplate()
  const remove = useDeleteTemplate()

  const [form, setForm] = useState<FormState>(() => ({
    title: template?.title ?? '',
    description: template?.description ?? '',
    day_of_week: template?.day_of_week ?? defaultDay,
    start_time: template?.start_time ?? '09:00',
    end_time: template?.end_time ?? '10:00',
    category_id: template?.category_id ?? null,
    reminder_minutes: template?.reminder_minutes ?? null,
    is_active: template?.is_active ?? true,
  }))
  const [error, setError] = useState<unknown>(null)

  const fieldError = (name: string) => (error instanceof ApiError ? error.field(name) : undefined)
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }))

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      await save.mutateAsync({
        id: template?.id,
        input: { ...form, title: form.title.trim(), description: form.description.trim() || null },
      })
      onClose()
    } catch (caught) {
      setError(caught)
    }
  }

  async function destroy() {
    if (!template) return
    setError(null)
    try {
      await remove.mutateAsync(template.id)
      onClose()
    } catch (caught) {
      setError(caught)
    }
  }

  return (
    <Sheet
      title={template ? 'Edit routine' : 'New routine'}
      onClose={onClose}
      footer={
        <Button type="submit" form={formId} size="lg" loading={save.isPending} className="w-full">
          Save Routine
        </Button>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="space-y-5">
        <Field label="Activity" error={fieldError('title')}>
          {(control) => (
            <input
              {...control}
              required
              autoFocus={!template}
              placeholder="e.g. Swimming Training"
              value={form.title}
              onChange={(event) => set('title', event.target.value)}
              className={inputClass}
            />
          )}
        </Field>

        <ChoiceChips label="Day" value={form.day_of_week} options={DAY_OPTIONS} onChange={(day) => set('day_of_week', day)} error={fieldError('day_of_week')} />

        <TimeRangeFields
          start={form.start_time}
          end={form.end_time}
          onChange={(start, end) => setForm((current) => ({ ...current, start_time: start, end_time: end }))}
          errors={{ start: fieldError('start_time'), end: fieldError('end_time') }}
        />

        <CategoryField value={form.category_id} onChange={(value) => set('category_id', value)} error={fieldError('category_id')} />

        <ReminderField value={form.reminder_minutes} onChange={(value) => set('reminder_minutes', value)} error={fieldError('reminder_minutes')} />

        <Field label="Description (optional)" error={fieldError('description')}>
          {(control) => (
            <textarea
              {...control}
              rows={3}
              value={form.description}
              onChange={(event) => set('description', event.target.value)}
              className={textareaClass}
            />
          )}
        </Field>

        <Switch
          label="Active"
          description="Paused routines stay here but don't appear on your timeline."
          checked={form.is_active}
          onChange={(checked) => set('is_active', checked)}
        />

        <FormError error={error} fields={SHOWN_FIELDS} />

        {template && (
          <div className="border-t border-line pt-5">
            <ConfirmButton icon={<Trash2 />} loading={remove.isPending} onConfirm={destroy} className="w-full">
              Delete routine
            </ConfirmButton>
            <p className="mt-2 text-center text-[13px] text-ink-muted">Removes it from every week, including single-day changes.</p>
          </div>
        )}
      </form>
    </Sheet>
  )
}
