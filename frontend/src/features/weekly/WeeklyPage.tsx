import { Bell, ChevronRight, Pause, Plus, Repeat, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { CategoryBadge } from '../../components/CategoryBadge'
import { FloatingActionButton } from '../../components/FloatingActionButton'
import { Button, EmptyState, Notice, Tag } from '../../components/ui'
import { useNow } from '../../hooks/useNow'
import { colorStyle } from '../../lib/categories'
import { cn } from '../../lib/cn'
import { isoWeekday, WEEKDAYS, weekdayName } from '../../lib/date'
import { formatDuration, formatRange } from '../../lib/time'
import type { ScheduleTemplate } from '../../types/api'
import { useUser } from '../auth/api'
import { useTemplates } from './api'
import { TemplateSheet } from './TemplateSheet'

type Editor = { type: 'create' } | { type: 'edit'; id: number } | null

/** The configuration area for recurring routines (the weekly template). */
export function WeeklyPage() {
  const user = useUser()
  const now = useNow(user.timezone)
  const [params, setParams] = useSearchParams()
  const templates = useTemplates()

  // ?day=1..7 picks the weekday; ?edit={id} opens a routine (linked from Today).
  const dayParam = Number(params.get('day'))
  const day = dayParam >= 1 && dayParam <= 7 ? dayParam : isoWeekday(now.date)
  const linkedId = Number(params.get('edit')) || null

  const [editor, setEditor] = useState<Editor>(null)
  const editingId = editor?.type === 'edit' ? editor.id : editor === null ? linkedId : null
  const editing = editingId ? templates.data?.find((template) => template.id === editingId) : undefined

  const all = templates.data ?? []
  const forDay = all.filter((template) => template.day_of_week === day)

  const selectDay = (value: number) => setParams({ day: String(value) }, { replace: true })
  const closeEditor = () => {
    setEditor(null)
    if (linkedId) selectDay(day)
  }

  return (
    <>
      <header className="pt-2 pb-5">
        <h1 className="text-[28px] leading-none font-bold tracking-tight">Weekly Schedule</h1>
        <p className="mt-2 text-sm text-ink-muted">Your routine. Every change applies to each week.</p>
      </header>

      <div role="group" aria-label="Weekday" className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((weekday) => {
          const count = all.filter((template) => template.day_of_week === weekday.value && template.is_active).length
          const selected = weekday.value === day

          return (
            <button
              key={weekday.value}
              type="button"
              aria-pressed={selected}
              aria-label={`${weekday.long}, ${count} ${count === 1 ? 'activity' : 'activities'}`}
              onClick={() => selectDay(weekday.value)}
              className={cn(
                'flex h-14 flex-col items-center justify-center gap-1 rounded-[16px] border text-[12px] font-semibold tracking-wide uppercase transition',
                selected ? 'glass border-white/80 bg-white/70 text-ink' : 'border-transparent text-ink-muted hover:bg-white/50',
              )}
            >
              {weekday.short}
              <span aria-hidden className="flex h-1 gap-0.5">
                {Array.from({ length: Math.min(count, 3) }, (_, index) => (
                  <span key={index} className={cn('size-1 rounded-full', selected ? 'bg-accent' : 'bg-black/20')} />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      <section aria-labelledby="weekday-heading" className="mt-7">
        <h2 id="weekday-heading" className="mb-3 px-1 text-[12px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
          {weekdayName(day)}
        </h2>

        {templates.isPending ? (
          <div role="status" aria-label="Loading routines" className="h-40 animate-pulse rounded-lg bg-black/[0.04]" />
        ) : templates.isError ? (
          <div className="space-y-3">
            <Notice>{templates.error.message}</Notice>
            <Button variant="secondary" icon={<RotateCcw />} onClick={() => templates.refetch()}>
              Try again
            </Button>
          </div>
        ) : forDay.length === 0 ? (
          <EmptyState
            icon={<Repeat />}
            title={`No routine on ${weekdayName(day)} yet.`}
            message={`Add a recurring activity and it will appear on every ${weekdayName(day)}.`}
            action={
              <Button icon={<Plus />} onClick={() => setEditor({ type: 'create' })}>
                Add routine
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white/70 shadow-soft">
            {forDay.map((template) => (
              <TemplateRow key={template.id} template={template} onOpen={() => setEditor({ type: 'edit', id: template.id })} />
            ))}
          </ul>
        )}
      </section>

      <FloatingActionButton label="Add routine" onClick={() => setEditor({ type: 'create' })} />

      {editor?.type === 'create' && <TemplateSheet defaultDay={day} onClose={closeEditor} />}
      {editing && <TemplateSheet key={editing.id} template={editing} defaultDay={day} onClose={closeEditor} />}
    </>
  )
}

function TemplateRow({ template, onOpen }: { template: ScheduleTemplate; onOpen: () => void }) {
  return (
    <li>
      <button type="button" onClick={onOpen} className="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-white">
        <time dateTime={template.start_time} className="w-11 shrink-0 pt-0.5 text-right text-[13px] font-medium text-ink-muted tabular-nums">
          {template.start_time}
        </time>
        <span
          aria-hidden
          className={cn('mt-1.5 size-3 shrink-0 rounded-full border-2', template.is_active ? colorStyle(template.category?.color).border : 'border-black/20')}
        />
        <span className="min-w-0 flex-1">
          <span className={cn('block truncate text-base font-semibold', !template.is_active && 'text-ink-muted')}>{template.title}</span>
          <span className="mt-0.5 block text-[13px] text-ink-muted tabular-nums">
            {formatRange(template.start_time, template.end_time)} · {formatDuration(template.duration_minutes)}
          </span>
          <span className="mt-2 flex flex-wrap gap-1.5">
            {template.category && <CategoryBadge category={template.category} />}
            {template.reminder_minutes !== null && <Tag icon={Bell}>{template.reminder_minutes}m</Tag>}
            {!template.is_active && <Tag icon={Pause}>Paused</Tag>}
          </span>
        </span>
        <ChevronRight className="mt-1 size-4 shrink-0 text-ink-muted" aria-hidden />
      </button>
    </li>
  )
}
