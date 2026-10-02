import { Ban, Bell, Check, Repeat, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { CategoryBadge } from '../../components/CategoryBadge'
import { Tag } from '../../components/ui'
import { colorStyle } from '../../lib/categories'
import { cn } from '../../lib/cn'
import { formatDuration, formatRange, toMinutes } from '../../lib/time'
import { buildRows, currentItem } from '../../lib/timeline'
import type { FreeTime, Timeline as TimelineData, TimelineItem as TimelineItemData } from '../../types/api'

interface TimelineProps {
  timeline: TimelineData
  /** Minutes since midnight when the timeline shows today; null for other dates. */
  nowMinutes: number | null
  onOpen: (item: TimelineItemData) => void
}

/** The day as one continuous vertical line: activities, with free time in between. */
export function Timeline({ timeline, nowMinutes, onOpen }: TimelineProps) {
  const current = nowMinutes === null ? undefined : currentItem(timeline.schedules, nowMinutes)

  return (
    <ol aria-label="Timeline">
      {buildRows(timeline).map((row) =>
        row.kind === 'item' ? (
          <TimelineItem
            key={row.item.key}
            item={row.item}
            isCurrent={row.item.key === current?.key}
            isPast={nowMinutes !== null && toMinutes(row.item.end_time) <= nowMinutes}
            onOpen={() => onOpen(row.item)}
          />
        ) : (
          <FreeTimeBlock key={`free-${row.gap.start_time}`} gap={row.gap} />
        ),
      )}
    </ol>
  )
}

/** The vertical line; it starts and ends at the first and last node. */
function Rail({ dashed = false, children }: { dashed?: boolean; children?: ReactNode }) {
  return (
    <div className="relative flex w-4 shrink-0 justify-center">
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0 left-1/2 -translate-x-1/2 group-first:top-5 group-last:bottom-auto group-last:h-5',
          dashed ? 'border-l-2 border-dashed border-black/12' : 'w-px bg-black/10',
        )}
      />
      {children}
    </div>
  )
}

interface TimelineItemProps {
  item: TimelineItemData
  isCurrent: boolean
  isPast: boolean
  onOpen: () => void
}

function TimelineItem({ item, isCurrent, isPast, onOpen }: TimelineItemProps) {
  const completed = item.status === 'completed'
  const cancelled = item.status === 'cancelled'

  return (
    <li className="group flex gap-3">
      <time
        dateTime={item.start_time}
        className={cn(
          'w-11 shrink-0 pt-2.5 text-right text-[13px] font-medium tabular-nums',
          isCurrent ? 'text-accent-strong' : 'text-ink-muted',
        )}
      >
        {item.start_time}
      </time>

      <Rail>
        <TimelineNode item={item} isCurrent={isCurrent} isPast={isPast} />
      </Rail>

      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'mb-4 min-w-0 flex-1 rounded-md px-3 py-2 text-left transition hover:bg-white/70 active:bg-white',
          isCurrent && 'bg-white/70 shadow-soft',
        )}
      >
        <span
          className={cn(
            'block truncate text-base font-semibold',
            cancelled && 'text-ink-muted line-through decoration-1',
            !cancelled && (completed || isPast) && 'text-ink/60',
          )}
        >
          {item.title}
        </span>
        <span className="mt-0.5 block text-[13px] text-ink-muted tabular-nums">
          {formatRange(item.start_time, item.end_time)} · {formatDuration(item.duration_minutes)}
        </span>
        <span className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.category && <CategoryBadge category={item.category} />}
          {completed && <Tag icon={Check}>Done</Tag>}
          {cancelled && <Tag icon={Ban}>{item.source === 'manual' ? 'Cancelled' : 'Skipped'}</Tag>}
          {item.source === 'weekly_template' && <Tag icon={Repeat}>{item.is_modified ? 'Changed today' : 'Weekly'}</Tag>}
          {item.reminder_minutes !== null && !cancelled && <Tag icon={Bell}>{item.reminder_minutes}m</Tag>}
          {item.has_conflict && (
            <Tag icon={TriangleAlert} tone="warning">
              Overlaps
            </Tag>
          )}
        </span>
      </button>
    </li>
  )
}

/** Status is also written out in the item, never shown by color alone. */
function TimelineNode({ item, isCurrent, isPast }: { item: TimelineItemData; isCurrent: boolean; isPast: boolean }) {
  const color = colorStyle(item.category?.color)

  if (item.status === 'completed') {
    return (
      <span className={cn('relative mt-3 flex size-4 items-center justify-center rounded-full text-white', color.dot)}>
        <Check className="size-2.5" strokeWidth={4} aria-hidden />
      </span>
    )
  }

  if (item.status === 'cancelled') {
    return <span className="relative mt-3.5 size-3 rounded-full border-2 border-dashed border-black/25 bg-canvas" />
  }

  if (isCurrent) {
    return <span className="relative mt-3 size-4 rounded-full bg-accent ring-4 ring-accent/20" />
  }

  return <span className={cn('relative mt-3.5 size-3 rounded-full border-2 bg-canvas', isPast ? 'border-black/20' : color.border)} />
}

function FreeTimeBlock({ gap }: { gap: FreeTime }) {
  return (
    <li className="group flex gap-3">
      <time dateTime={gap.start_time} className="w-11 shrink-0 pt-3 text-right text-[13px] text-ink-muted tabular-nums">
        {gap.start_time}
      </time>
      <Rail dashed />
      <p className="mb-4 flex-1 px-3 py-3 text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
        Free time · {formatDuration(gap.duration_minutes)}
      </p>
    </li>
  )
}

export function TimelineSkeleton() {
  return (
    <div role="status" aria-label="Loading your day" className="space-y-6">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex animate-pulse gap-3">
          <span className="mt-2 h-3 w-11 rounded bg-black/[0.06]" />
          <span className="mt-2.5 size-3 rounded-full bg-black/[0.08]" />
          <span className="flex-1 space-y-2 px-3 py-1">
            <span className="block h-4 w-2/3 rounded bg-black/[0.07]" />
            <span className="block h-3 w-1/3 rounded bg-black/[0.05]" />
          </span>
        </div>
      ))}
    </div>
  )
}
