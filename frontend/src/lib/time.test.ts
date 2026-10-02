import { describe, expect, it } from 'vitest'
import { addMinutes, formatDuration, fromMinutes, shiftEnd, suggestedStart, toMinutes } from './time'

describe('time helpers', () => {
  it('converts between HH:MM and minutes', () => {
    expect(toMinutes('07:30')).toBe(450)
    expect(fromMinutes(450)).toBe('07:30')
    expect(fromMinutes(24 * 60 + 10)).toBe('23:59')
  })

  it('formats durations compactly', () => {
    expect(formatDuration(45)).toBe('45m')
    expect(formatDuration(120)).toBe('2h')
    expect(formatDuration(90)).toBe('1h 30m')
  })

  it('suggests the next full hour today, otherwise 09:00', () => {
    expect(suggestedStart(14 * 60 + 5)).toBe('15:00')
    // Late at night the one-hour default must still fit before midnight.
    expect(suggestedStart(23 * 60 + 30)).toBe('22:00')
    expect(suggestedStart(null)).toBe('09:00')
  })

  it('keeps the duration when the start moves', () => {
    expect(shiftEnd('07:00', '09:00', '08:00')).toBe('10:00')
    expect(shiftEnd('07:00', '07:00', '08:00')).toBe('08:15')
    expect(addMinutes('23:30', 60)).toBe('23:59')
  })
})
