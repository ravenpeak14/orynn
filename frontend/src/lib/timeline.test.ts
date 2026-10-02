import { describe, expect, it } from 'vitest'
import type { ScheduleStatus, Timeline, TimelineItem } from '../types/api'
import { buildRows, currentItem, nextItem, progressOf } from './timeline'

function item(title: string, start: string, end: string, status: ScheduleStatus = 'scheduled'): TimelineItem {
  return {
    key: `schedule-${title}`,
    source: 'manual',
    schedule_id: 1,
    template_id: null,
    override_id: null,
    is_modified: false,
    title,
    description: null,
    date: '2026-09-28',
    start_time: start,
    end_time: end,
    duration_minutes: 0,
    status,
    reminder_minutes: null,
    category: null,
    has_conflict: false,
  }
}

const swimming = item('Swimming', '07:00', '09:00')
const university = item('University', '10:00', '12:00')
const coding = item('Coding', '19:00', '21:00')

describe('timeline helpers', () => {
  it('interleaves free time between activities', () => {
    const timeline: Timeline = {
      date: '2026-09-28',
      day_of_week: 1,
      schedules: [swimming, university, coding],
      free_time: [
        { start_time: '09:00', end_time: '10:00', duration_minutes: 60 },
        { start_time: '12:00', end_time: '19:00', duration_minutes: 420 },
      ],
    }

    expect(buildRows(timeline).map((row) => (row.kind === 'item' ? row.item.title : `free ${row.gap.start_time}`))).toEqual([
      'Swimming',
      'free 09:00',
      'University',
      'free 12:00',
      'Coding',
    ])
  })

  it('finds the current and the next activity', () => {
    const items = [swimming, university, coding]

    expect(currentItem(items, 8 * 60)?.title).toBe('Swimming')
    expect(currentItem(items, 9 * 60)).toBeUndefined()
    expect(nextItem(items, 9 * 60)?.title).toBe('University')
    expect(nextItem(items, 22 * 60)).toBeUndefined()
  })

  it('ignores completed and cancelled activities when looking for "now"', () => {
    expect(currentItem([item('Done', '07:00', '09:00', 'completed')], 8 * 60)).toBeUndefined()
    expect(currentItem([item('Skipped', '07:00', '09:00', 'cancelled')], 8 * 60)).toBeUndefined()
  })

  it('reports the position in time between start and end', () => {
    expect(progressOf(swimming, 8 * 60)).toBe(0.5)
    expect(progressOf(swimming, 6 * 60)).toBe(0)
    expect(progressOf(swimming, 10 * 60)).toBe(1)
  })
})
