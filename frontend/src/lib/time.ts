/** Helpers for "HH:MM" times within one day. */

const LAST_MINUTE = 23 * 60 + 59

const pad = (value: number) => String(value).padStart(2, '0')

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function fromMinutes(total: number): string {
  const clamped = Math.min(Math.max(Math.round(total), 0), LAST_MINUTE)
  return `${pad(Math.floor(clamped / 60))}:${pad(clamped % 60)}`
}

/** 90 → "1h 30m", 120 → "2h", 45 → "45m". */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (hours && rest) return `${hours}h ${rest}m`
  if (hours) return `${hours}h`
  return `${rest}m`
}

/** "07:00 — 09:00", as written in the UI style guide. */
export function formatRange(start: string, end: string): string {
  return `${start} — ${end}`
}

export function formatReminder(minutes: number): string {
  return minutes >= 60 ? `${minutes / 60}h before` : `${minutes} min before`
}

/**
 * Suggested start for a new schedule: the next full hour today, otherwise
 * 09:00. Capped at 22:00 so the default one-hour slot still fits in the day.
 */
export function suggestedStart(nowMinutes: number | null): string {
  if (nowMinutes === null) return '09:00'
  return fromMinutes(Math.min((Math.floor(nowMinutes / 60) + 1) * 60, 22 * 60))
}

/** Move the end time along with the start, keeping the duration (at least 15 minutes). */
export function shiftEnd(previousStart: string, previousEnd: string, nextStart: string): string {
  const duration = Math.max(toMinutes(previousEnd) - toMinutes(previousStart), 15)
  return fromMinutes(toMinutes(nextStart) + duration)
}

export function addMinutes(time: string, minutes: number): string {
  return fromMinutes(toMinutes(time) + minutes)
}
