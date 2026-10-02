import type { FreeTime, Timeline, TimelineItem } from '../types/api'
import { toMinutes } from './time'

export type TimelineRow = { kind: 'item'; item: TimelineItem } | { kind: 'free'; gap: FreeTime }

/** Activities and free-time gaps in one chronological list. */
export function buildRows(timeline: Timeline): TimelineRow[] {
  const rows = [
    ...timeline.schedules.map((item) => ({ at: toMinutes(item.start_time), order: 0, row: { kind: 'item', item } as const })),
    ...timeline.free_time.map((gap) => ({ at: toMinutes(gap.start_time), order: 1, row: { kind: 'free', gap } as const })),
  ]

  return rows.sort((a, b) => a.at - b.at || a.order - b.order).map(({ row }) => row)
}

const isPending = (item: TimelineItem) => item.status === 'scheduled'

/** The activity happening right now (completed or cancelled ones are not "current"). */
export function currentItem(items: TimelineItem[], nowMinutes: number): TimelineItem | undefined {
  return items.find(
    (item) => isPending(item) && toMinutes(item.start_time) <= nowMinutes && nowMinutes < toMinutes(item.end_time),
  )
}

export function nextItem(items: TimelineItem[], nowMinutes: number): TimelineItem | undefined {
  return items.find((item) => isPending(item) && toMinutes(item.start_time) > nowMinutes)
}

/** Position in time between start and end, from 0 to 1. This is not time tracking. */
export function progressOf(item: TimelineItem, nowMinutes: number): number {
  const start = toMinutes(item.start_time)
  const end = toMinutes(item.end_time)

  return Math.min(1, Math.max(0, (nowMinutes - start) / (end - start)))
}
