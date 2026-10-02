import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, IconButton } from '../../components/ui'
import { formatMonth, formatYear } from '../../lib/date'

interface TopBarProps {
  date: string
  isToday: boolean
  onToday: () => void
  onPreviousWeek: () => void
  onNextWeek: () => void
}

export function TopBar({ date, isToday, onToday, onPreviousWeek, onNextWeek }: TopBarProps) {
  return (
    <header className="flex items-end justify-between gap-4 pt-2 pb-5">
      <div>
        <h1 className="text-[28px] leading-none font-bold tracking-tight">{formatMonth(date)}</h1>
        <p className="mt-1.5 text-sm text-ink-muted">{formatYear(date)}</p>
      </div>
      <div className="flex items-center gap-1">
        {!isToday && (
          <Button size="sm" variant="secondary" onClick={onToday} className="mr-1">
            Today
          </Button>
        )}
        <IconButton label="Previous week" onClick={onPreviousWeek}>
          <ChevronLeft className="size-5" aria-hidden />
        </IconButton>
        <IconButton label="Next week" onClick={onNextWeek}>
          <ChevronRight className="size-5" aria-hidden />
        </IconButton>
      </div>
    </header>
  )
}
