import { type FormEvent, useId, useState } from 'react'
import { Sheet } from '../../components/Sheet'
import { Button, Field, FormError, Switch } from '../../components/ui'
import { ApiError } from '../../lib/api'
import { formatLongDate, isoWeekday, weekdayName } from '../../lib/date'
import { inputClass, textareaClass } from '../../lib/styles'
import { addMinutes } from '../../lib/time'
import type { OverrideInput, RecurringTimelineItem, TimelineItem } from '../../types/api'
import { CategoryField, ReminderField, TimeRangeFields } from '../schedules/fields'
import { useSaveTemplate } from '../weekly/api'
import { useSaveOverride, useSaveSchedule } from './api'

type ScheduleSheetProps =
  | { mode: 'create'; date: string; start: string; onClose: () => void }
  | { mode: 'edit'; item: TimelineItem; onClose: () => void }

interface FormState {
  title: string
  date: string
  start_time: string
  end_time: string
  category_id: number | null
  reminder_minutes: number | null
  description: string
}

const SHOWN_FIELDS = ['title', 'date', 'start_time', 'end_time', 'category_id', 'reminder_minutes', 'description']

function initialState(props: ScheduleSheetProps): FormState {
  if (props.mode === 'edit') {
    const { item } = props
    return {
      title: item.title,
      date: item.date,
      start_time: item.start_time,
      end_time: item.end_time,
      category_id: item.category?.id ?? null,
      reminder_minutes: item.reminder_minutes,
      description: item.description ?? '',
    }
  }

  return {
    title: '',
    date: props.date,
    start_time: props.start,
    end_time: addMinutes(props.start, 60),
    category_id: null,
    reminder_minutes: null,
    description: '',
  }
}

/**
 * A single-day edit of a weekly routine only sends what changed, so the
 * other fields keep following the routine.
 */
function overrideChanges(item: RecurringTimelineItem, form: FormState): { id?: number; input: OverrideInput } {
  const changes: OverrideInput = { action: 'modify' }
  const description = form.description.trim()

  if (form.title.trim() !== item.title) changes.title = form.title.trim()
  if (form.start_time !== item.start_time) changes.start_time = form.start_time
  if (form.end_time !== item.end_time) changes.end_time = form.end_time
  if (form.category_id !== (item.category?.id ?? null)) changes.category_id = form.category_id
  // 0 explicitly switches off a reminder inherited from the routine.
  if (form.reminder_minutes !== item.reminder_minutes) changes.reminder_minutes = form.reminder_minutes ?? 0
  if (description !== (item.description ?? '')) changes.description = description || null

  return item.override_id
    ? { id: item.override_id, input: changes }
    : { input: { ...changes, schedule_template_id: item.template_id, date: item.date } }
}

export function ScheduleSheet(props: ScheduleSheetProps) {
  const item = props.mode === 'edit' ? props.item : null
  const occurrence = item?.source === 'weekly_template'
  const formId = useId()

  const [form, setForm] = useState(() => initialState(props))
  const [repeatWeekly, setRepeatWeekly] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [saving, setSaving] = useState(false)

  const saveSchedule = useSaveSchedule()
  const saveOverride = useSaveOverride()
  const saveTemplate = useSaveTemplate()

  const fieldError = (name: string) => (error instanceof ApiError ? error.field(name) : undefined)
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }))

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const fields = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      start_time: form.start_time,
      end_time: form.end_time,
      category_id: form.category_id,
      reminder_minutes: form.reminder_minutes,
    }

    try {
      if (item?.source === 'weekly_template') {
        await saveOverride.mutateAsync(overrideChanges(item, form))
      } else if (repeatWeekly) {
        await saveTemplate.mutateAsync({ input: { ...fields, day_of_week: isoWeekday(form.date), is_active: true } })
      } else {
        await saveSchedule.mutateAsync({ id: item?.schedule_id, input: { ...fields, date: form.date } })
      }
      props.onClose()
    } catch (caught) {
      setError(caught)
      setSaving(false)
    }
  }

  const title = occurrence ? 'Edit this day' : item ? 'Edit schedule' : 'New schedule'

  return (
    <Sheet
      title={title}
      onClose={props.onClose}
      footer={
        <Button type="submit" form={formId} size="lg" loading={saving} className="w-full">
          Save Schedule
        </Button>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="space-y-5">
        {occurrence && (
          <p className="rounded-md bg-accent-soft px-3.5 py-2.5 text-sm text-accent-strong">
            Changes apply to {formatLongDate(form.date)} only. Your weekly routine stays the same.
          </p>
        )}

        <Field label="Activity" error={fieldError('title')}>
          {(control) => (
            <input
              {...control}
              required
              autoFocus={!item}
              placeholder="e.g. Dentist"
              value={form.title}
              onChange={(event) => set('title', event.target.value)}
              className={inputClass}
            />
          )}
        </Field>

        {!occurrence && (
          <Field label="Date" error={fieldError('date')}>
            {(control) => (
              <input
                {...control}
                type="date"
                required
                value={form.date}
                onChange={(event) => event.target.value && set('date', event.target.value)}
                className={inputClass}
              />
            )}
          </Field>
        )}

        <TimeRangeFields
          start={form.start_time}
          end={form.end_time}
          onChange={(start, end) => setForm((current) => ({ ...current, start_time: start, end_time: end }))}
          errors={{ start: fieldError('start_time'), end: fieldError('end_time') }}
        />

        <CategoryField
          value={form.category_id}
          onChange={(value) => set('category_id', value)}
          allowNone={!occurrence}
          error={fieldError('category_id')}
        />

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

        {props.mode === 'create' && (
          <Switch
            label={`Repeat every ${weekdayName(isoWeekday(form.date))}`}
            description="Adds it to your weekly routine instead of only this date."
            checked={repeatWeekly}
            onChange={setRepeatWeekly}
          />
        )}

        <FormError error={error} fields={SHOWN_FIELDS} />
      </form>
    </Sheet>
  )
}
