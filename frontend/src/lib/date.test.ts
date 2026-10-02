import { describe, expect, it } from 'vitest'
import { addDays, formatLongDate, isDateString, isoWeekday, nowIn, weekOf } from './date'

describe('calendar dates', () => {
  it('validates YYYY-MM-DD strings', () => {
    expect(isDateString('2026-09-28')).toBe(true)
    expect(isDateString('2026-02-30')).toBe(false)
    expect(isDateString('28-09-2026')).toBe(false)
    expect(isDateString(null)).toBe(false)
  })

  it('adds days across months and years', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })

  it('uses ISO weekdays like the API (Monday = 1, Sunday = 7)', () => {
    expect(isoWeekday('2026-09-28')).toBe(1)
    expect(isoWeekday('2026-10-04')).toBe(7)
  })

  it('builds a Monday-to-Sunday week', () => {
    expect(weekOf('2026-10-01')).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ])
  })

  it('formats dates without shifting them by the device timezone', () => {
    expect(formatLongDate('2026-09-28')).toBe('Monday 28 September')
  })
})

describe('nowIn', () => {
  const at = Date.UTC(2026, 8, 28, 20, 30) // 20:30 UTC on 28 September

  it('reads the date and time in the given timezone', () => {
    expect(nowIn('UTC', at)).toEqual({ date: '2026-09-28', minutes: 20 * 60 + 30 })
    // Jakarta is UTC+7, already the next morning.
    expect(nowIn('Asia/Jakarta', at)).toEqual({ date: '2026-09-29', minutes: 3 * 60 + 30 })
  })

  it('falls back instead of throwing on an unknown timezone', () => {
    expect(() => nowIn('Mars/Olympus', at)).not.toThrow()
  })
})
