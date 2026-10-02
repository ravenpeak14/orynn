import { Ban, Bell, CalendarDays, Check, Clock, type LucideIcon, Pencil, Repeat, RotateCcw, Trash2, Undo2 } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { CategoryBadge } from '../../components/CategoryBadge'
import { Sheet } from '../../components/Sheet'
import { Button, ConfirmButton, FormError, Notice, Tag } from '../../components/ui'
import { formatLongDate } from '../../lib/date'
import { formatDuration, formatRange, formatReminder } from '../../lib/time'
import type { RecurringTimelineItem, TimelineItem } from '../../types/api'
import { useItemActions } from './useItemActions'

interface ScheduleDetailProps {
  item: TimelineItem
  onClose: () => void
  onEdit: (item: TimelineItem) => void
  onEditRoutine: (item: RecurringTimelineItem) => void
}

export function ScheduleDetail({ item, onClose, onEdit, onEditRoutine }: ScheduleDetailProps) {
  const actions = useItemActions()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<unknown>(null)

  async function run(name: string, action: () => Promise<unknown>) {
    setBusy(name)
    setError(null)
    try {
      await action()
      onClose()
    } catch (caught) {
      setError(caught)
      setBusy(null)
    }
  }

  const done = item.status === 'completed'
  const cancelled = item.status === 'cancelled'
  const recurring = item.source === 'weekly_template'

  return (
    <Sheet title={item.title} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-1.5">
          {item.category && <CategoryBadge category={item.category} />}
          {recurring && <Tag icon={Repeat}>{item.is_modified ? 'Weekly · changed today' : 'Weekly routine'}</Tag>}
          {done && <Tag icon={Check}>Done</Tag>}
          {cancelled && <Tag icon={Ban}>{recurring ? 'Skipped' : 'Cancelled'}</Tag>}
        </div>

        <ul className="space-y-2.5 text-[15px]">
          <Detail icon={CalendarDays}>{formatLongDate(item.date)}</Detail>
          <Detail icon={Clock}>
            <span className="tabular-nums">{formatRange(item.start_time, item.end_time)}</span> · {formatDuration(item.duration_minutes)}
          </Detail>
          <Detail icon={Bell}>{item.reminder_minutes ? formatReminder(item.reminder_minutes) : 'No reminder'}</Detail>
        </ul>

        {item.description && <p className="rounded-md bg-black/[0.03] p-3.5 text-[15px] whitespace-pre-line">{item.description}</p>}

        {item.has_conflict && !cancelled && <Notice tone="warning">This overlaps with another activity on your timeline.</Notice>}

        <FormError error={error} />

        <div className="grid gap-2">
          {!cancelled && (
            <Button
              size="lg"
              variant={done ? 'secondary' : 'primary'}
              icon={done ? <Undo2 /> : <Check />}
              loading={busy === 'done'}
              disabled={busy !== null}
              onClick={() => run('done', () => actions.setDone(item, !done))}
            >
              {done ? 'Mark as not done' : 'Mark as done'}
            </Button>
          )}

          {cancelled ? (
            <Button
              size="lg"
              icon={<RotateCcw />}
              loading={busy === 'restore'}
              disabled={busy !== null}
              onClick={() => run('restore', () => actions.restore(item))}
            >
              Restore
            </Button>
          ) : (
            <>
              <Button size="lg" variant="secondary" icon={<Pencil />} disabled={busy !== null} onClick={() => onEdit(item)}>
                {recurring ? 'Edit this day only' : 'Edit'}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                icon={<Ban />}
                loading={busy === 'cancel'}
                disabled={busy !== null}
                onClick={() => run('cancel', () => actions.cancel(item))}
              >
                {recurring ? 'Skip this day' : 'Cancel activity'}
              </Button>
            </>
          )}

          {item.source === 'weekly_template' && (
            <>
              {item.is_modified && (
                <Button
                  size="lg"
                  variant="ghost"
                  icon={<Undo2 />}
                  loading={busy === 'reset'}
                  disabled={busy !== null}
                  onClick={() => run('reset', () => actions.resetToRoutine(item))}
                >
                  Reset to weekly routine
                </Button>
              )}
              <Button size="lg" variant="ghost" icon={<Repeat />} disabled={busy !== null} onClick={() => onEditRoutine(item)}>
                Edit weekly routine
              </Button>
            </>
          )}

          {item.source === 'manual' && (
            <ConfirmButton icon={<Trash2 />} loading={busy === 'delete'} onConfirm={() => run('delete', () => actions.remove(item))}>
              Delete schedule
            </ConfirmButton>
          )}
        </div>
      </div>
    </Sheet>
  )
}

function Detail({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <Icon className="size-4.5 shrink-0 text-ink-muted" aria-hidden />
      <span>{children}</span>
    </li>
  )
}
