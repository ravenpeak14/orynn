import { Plus, RotateCcw, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { FloatingActionButton } from '../../components/FloatingActionButton'
import { Button, EmptyState, Notice } from '../../components/ui'
import { useNow } from '../../hooks/useNow'
import { useSwipe } from '../../hooks/useSwipe'
import { addDays, isDateString, isoWeekday } from '../../lib/date'
import { suggestedStart } from '../../lib/time'
import { useUser } from '../auth/api'
import { useTimeline } from './api'
import { CurrentActivity } from './CurrentActivity'
import { DateSelector } from './DateSelector'
import { ScheduleDetail } from './ScheduleDetail'
import { ScheduleSheet } from './ScheduleSheet'
import { Timeline, TimelineSkeleton } from './Timeline'
import { TopBar } from './TopBar'

type OpenSheet = { type: 'create' } | { type: 'detail'; key: string } | { type: 'edit'; key: string } | null

export function TodayPage() {
  const user = useUser()
  const now = useNow(user.timezone)
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  // The selected date lives in the URL (?date=YYYY-MM-DD); no date means today.
  const requested = params.get('date')
  const selected = isDateString(requested) ? requested : now.date
  const isToday = selected === now.date

  const timeline = useTimeline(selected)
  const items = timeline.data?.schedules ?? []

  const [sheet, setSheet] = useState<OpenSheet>(null)
  const openItem = sheet && sheet.type !== 'create' ? items.find((item) => item.key === sheet.key) : undefined
  const closeSheet = useCallback(() => setSheet(null), [])

  const selectDate = useCallback(
    (date: string) => setParams(date === now.date ? {} : { date }, { replace: true }),
    [now.date, setParams],
  )

  // Desktop keyboard support: ← / → move one day.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (event.target instanceof Element && event.target.closest('input, textarea, select, dialog, [contenteditable]')) return

      if (event.key === 'ArrowLeft') selectDate(addDays(selected, -1))
      if (event.key === 'ArrowRight') selectDate(addDays(selected, 1))
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selected, selectDate])

  const swipe = useSwipe(
    () => selectDate(addDays(selected, 1)),
    () => selectDate(addDays(selected, -1)),
  )

  const openDetail = (item: { key: string }) => setSheet({ type: 'detail', key: item.key })
  const openCreate = () => setSheet({ type: 'create' })

  return (
    <>
      <TopBar
        date={selected}
        isToday={isToday}
        onToday={() => selectDate(now.date)}
        onPreviousWeek={() => selectDate(addDays(selected, -7))}
        onNextWeek={() => selectDate(addDays(selected, 7))}
      />

      <DateSelector selected={selected} today={now.date} onSelect={selectDate} />

      <section {...swipe} aria-label="Schedule" aria-busy={timeline.isFetching} className="mt-7 min-h-[50dvh]">
        {isToday && timeline.data && <CurrentActivity items={items} nowMinutes={now.minutes} onOpen={openDetail} />}

        {timeline.isPending ? (
          <TimelineSkeleton />
        ) : timeline.isError ? (
          <div className="space-y-3">
            <Notice>{timeline.error.message}</Notice>
            <Button variant="secondary" icon={<RotateCcw />} onClick={() => timeline.refetch()}>
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Sparkles />}
            title="Nothing planned."
            message="Your day is wide open."
            action={
              <Button icon={<Plus />} onClick={openCreate}>
                Add schedule
              </Button>
            }
          />
        ) : (
          <Timeline timeline={timeline.data} nowMinutes={isToday ? now.minutes : null} onOpen={openDetail} />
        )}
      </section>

      <FloatingActionButton label="Add schedule" onClick={openCreate} />

      {sheet?.type === 'create' && (
        <ScheduleSheet mode="create" date={selected} start={suggestedStart(isToday ? now.minutes : null)} onClose={closeSheet} />
      )}

      {sheet?.type === 'detail' && openItem && (
        <ScheduleDetail
          item={openItem}
          onClose={closeSheet}
          onEdit={(item) => setSheet({ type: 'edit', key: item.key })}
          onEditRoutine={(item) => navigate(`/weekly?day=${isoWeekday(item.date)}&edit=${item.template_id}`)}
        />
      )}

      {sheet?.type === 'edit' && openItem && <ScheduleSheet mode="edit" item={openItem} onClose={closeSheet} />}
    </>
  )
}
