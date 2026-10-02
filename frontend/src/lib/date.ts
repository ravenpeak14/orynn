/**
 * Calendar dates are "YYYY-MM-DD" strings, exactly as the API uses them.
 * Date math runs in UTC so a device's timezone never shifts a calendar day.
 */
export type DateString = string

const pad = (value: number) => String(value).padStart(2, '0')

function toUtcDate(date: DateString): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function fromUtcDate(value: Date): DateString {
  return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`
}

export function isDateString(value: string | null | undefined): value is DateString {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  return fromUtcDate(toUtcDate(value)) === value
}

export function addDays(date: DateString, days: number): DateString {
  const value = toUtcDate(date)
  value.setUTCDate(value.getUTCDate() + days)

  return fromUtcDate(value)
}

/** ISO weekday, as used by the API: 1 = Monday ... 7 = Sunday. */
export function isoWeekday(date: DateString): number {
  const day = toUtcDate(date).getUTCDay()
  return day === 0 ? 7 : day
}

/** The Monday-to-Sunday week containing the date. */
export function weekOf(date: DateString): DateString[] {
  const monday = addDays(date, 1 - isoWeekday(date))
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index))
}

export function dayOfMonth(date: DateString): number {
  return Number(date.slice(8, 10))
}

export const WEEKDAYS = [
  { value: 1, short: 'Mon', long: 'Monday' },
  { value: 2, short: 'Tue', long: 'Tuesday' },
  { value: 3, short: 'Wed', long: 'Wednesday' },
  { value: 4, short: 'Thu', long: 'Thursday' },
  { value: 5, short: 'Fri', long: 'Friday' },
  { value: 6, short: 'Sat', long: 'Saturday' },
  { value: 7, short: 'Sun', long: 'Sunday' },
] as const

export function weekdayName(day: number): string {
  return WEEKDAYS[day - 1]?.long ?? ''
}

function format(date: DateString, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' }).format(toUtcDate(date))
}

/** "September" */
export const formatMonth = (date: DateString) => format(date, { month: 'long' })

/** "2026" */
export const formatYear = (date: DateString) => format(date, { year: 'numeric' })

/** "Monday 28 September" */
export const formatLongDate = (date: DateString) => format(date, { weekday: 'long', day: 'numeric', month: 'long' })

export interface ZonedNow {
  date: DateString
  /** Minutes since midnight. */
  minutes: number
}

export function deviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

/** Today's date and the current time of day in an IANA timezone. */
export function nowIn(timeZone: string, at: number = Date.now()): ZonedNow {
  let parts: Intl.DateTimeFormatPart[]

  try {
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(at)
  } catch {
    // Unknown timezone: fall back to the device's own (or UTC).
    const fallback = deviceTimeZone()
    return nowIn(fallback === timeZone ? 'UTC' : fallback, at)
  }

  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? 0)

  return {
    date: `${part('year')}-${pad(part('month'))}-${pad(part('day'))}`,
    minutes: (part('hour') % 24) * 60 + part('minute'),
  }
}
