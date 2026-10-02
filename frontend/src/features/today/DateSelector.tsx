import { useSwipe } from '../../hooks/useSwipe'
import { cn } from '../../lib/cn'
import { addDays, dayOfMonth, formatLongDate, isoWeekday, WEEKDAYS, weekOf } from '../../lib/date'

interface DateSelectorProps {
  selected: string
  today: string
  onSelect: (date: string) => void
}

/** The Monday-to-Sunday week around the selected date. Swipe to change week. */
export function DateSelector({ selected, today, onSelect }: DateSelectorProps) {
  const swipe = useSwipe(
    () => onSelect(addDays(selected, 7)),
    () => onSelect(addDays(selected, -7)),
  )

  return (
    <div {...swipe} role="group" aria-label="Choose a date" className="grid grid-cols-7 gap-1">
      {weekOf(selected).map((date) => {
        const isSelected = date === selected
        const isToday = date === today

        return (
          <button
            key={date}
            type="button"
            aria-pressed={isSelected}
            aria-label={`${formatLongDate(date)}${isToday ? ', today' : ''}`}
            onClick={() => onSelect(date)}
            className={cn(
              'flex h-[72px] flex-col items-center justify-center gap-1 rounded-[18px] border transition',
              isSelected ? 'glass border-white/80 bg-white/70 text-ink' : 'border-transparent text-ink-muted hover:bg-white/50',
            )}
          >
            <span className="text-[11px] font-semibold tracking-wide uppercase">{WEEKDAYS[isoWeekday(date) - 1].short}</span>
            <span
              className={cn(
                'text-lg leading-none font-semibold tabular-nums',
                isSelected ? 'text-ink' : isToday && 'text-accent-strong',
              )}
            >
              {dayOfMonth(date)}
            </span>
            <span aria-hidden className={cn('size-1 rounded-full', isToday ? 'bg-accent' : 'bg-transparent')} />
          </button>
        )
      })}
    </div>
  )
}
