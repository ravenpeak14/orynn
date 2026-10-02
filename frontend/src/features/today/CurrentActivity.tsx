import { Clock } from 'lucide-react'
import { CategoryBadge } from '../../components/CategoryBadge'
import { formatDuration, formatRange, toMinutes } from '../../lib/time'
import { currentItem, nextItem, progressOf } from '../../lib/timeline'
import type { TimelineItem } from '../../types/api'

interface CurrentActivityProps {
  items: TimelineItem[]
  nowMinutes: number
  onOpen: (item: TimelineItem) => void
}

/** The "NOW" card for today, or a quiet "Up next" line between activities. */
export function CurrentActivity({ items, nowMinutes, onOpen }: CurrentActivityProps) {
  const current = currentItem(items, nowMinutes)

  if (current) {
    const percent = Math.round(progressOf(current, nowMinutes) * 100)
    const remaining = toMinutes(current.end_time) - nowMinutes

    return (
      <button
        type="button"
        onClick={() => onOpen(current)}
        className="glass mb-6 block w-full rounded-lg bg-white/65 p-5 text-left transition active:scale-[0.99]"
      >
        <span className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-accent-strong uppercase">
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inset-0 animate-ping rounded-full bg-accent/60" />
              <span className="relative size-2 rounded-full bg-accent" />
            </span>
            Now
          </span>
          {current.category && <CategoryBadge category={current.category} />}
        </span>
        <span className="mt-3 block text-xl font-semibold">{current.title}</span>
        <span className="mt-0.5 block text-sm text-ink-muted tabular-nums">{formatRange(current.start_time, current.end_time)}</span>
        <span
          role="progressbar"
          aria-label="Time elapsed"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="mt-4 block h-2 overflow-hidden rounded-full bg-black/[0.06]"
        >
          <span className="block h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </span>
        <span className="mt-2 block text-sm text-ink-muted">{formatDuration(remaining)} remaining</span>
      </button>
    )
  }

  const next = nextItem(items, nowMinutes)
  if (!next) return null

  return (
    <button
      type="button"
      onClick={() => onOpen(next)}
      className="mb-6 flex w-full items-center gap-3 rounded-lg border border-line bg-white/60 px-4 py-3 text-left transition hover:bg-white/80"
    >
      <Clock className="size-4 shrink-0 text-accent-strong" aria-hidden />
      <span className="min-w-0 text-sm">
        <span className="text-ink-muted">Up next · </span>
        <span className="font-semibold">{next.title}</span> at <span className="tabular-nums">{next.start_time}</span>
        <span className="text-ink-muted"> (in {formatDuration(toMinutes(next.start_time) - nowMinutes)})</span>
      </span>
    </button>
  )
}
