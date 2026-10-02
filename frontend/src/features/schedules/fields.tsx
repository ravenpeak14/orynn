import { ChoiceChips, Field } from '../../components/ui'
import { colorStyle } from '../../lib/categories'
import { cn } from '../../lib/cn'
import { inputClass } from '../../lib/styles'
import { shiftEnd } from '../../lib/time'
import { useCategories } from '../categories/api'

/** Form fields shared by one-off schedules, single-day edits and weekly routines. */

interface TimeRangeFieldsProps {
  start: string
  end: string
  onChange: (start: string, end: string) => void
  errors?: { start?: string; end?: string }
}

export function TimeRangeFields({ start, end, onChange, errors = {} }: TimeRangeFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Start time" error={errors.start}>
        {(control) => (
          <input
            {...control}
            type="time"
            required
            value={start}
            // Moving the start keeps the activity's duration.
            onChange={(event) => event.target.value && onChange(event.target.value, shiftEnd(start, end, event.target.value))}
            className={cn(inputClass, 'tabular-nums')}
          />
        )}
      </Field>
      <Field label="End time" error={errors.end}>
        {(control) => (
          <input
            {...control}
            type="time"
            required
            value={end}
            onChange={(event) => event.target.value && onChange(start, event.target.value)}
            className={cn(inputClass, 'tabular-nums')}
          />
        )}
      </Field>
    </div>
  )
}

interface CategoryFieldProps {
  value: number | null
  onChange: (value: number | null) => void
  /** Single-day edits cannot remove the routine's category, only change it. */
  allowNone?: boolean
  error?: string
}

export function CategoryField({ value, onChange, allowNone = true, error }: CategoryFieldProps) {
  const categories = useCategories()

  const options = [
    ...(allowNone ? [{ value: null, label: 'None' }] : []),
    ...(categories.data ?? []).map((category) => ({
      value: category.id,
      label: category.name,
      icon: <span aria-hidden className={cn('size-2.5 rounded-full', colorStyle(category.color).dot)} />,
    })),
  ]

  return <ChoiceChips<number | null> label="Category" value={value} options={options} onChange={onChange} error={error} />
}

const REMINDERS = [
  { value: null, label: 'None' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
]

export function ReminderField({ value, onChange, error }: { value: number | null; onChange: (value: number | null) => void; error?: string }) {
  return <ChoiceChips<number | null> label="Reminder before start" value={value} options={REMINDERS} onChange={onChange} error={error} />
}
