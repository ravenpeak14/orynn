import { useToast } from '../../components/toast-context'
import type { ManualTimelineItem, RecurringTimelineItem, TimelineItem } from '../../types/api'
import { useDeleteOverride, useDeleteSchedule, useSaveOverride, useScheduleStatus } from './api'

/**
 * Status changes for timeline items. One-off schedules change their own
 * status; a weekly occurrence is changed through an override for that date,
 * so the routine itself is never touched.
 */
export function useItemActions() {
  const toast = useToast()
  const scheduleStatus = useScheduleStatus()
  const saveOverride = useSaveOverride({ toastSuccess: false })
  const deleteOverride = useDeleteOverride()
  const deleteSchedule = useDeleteSchedule()

  async function withToast(action: Promise<unknown>, message: string) {
    await action
    toast.success(message)
  }

  /** Update this occurrence's override, creating it when there is none yet. */
  function override(item: RecurringTimelineItem, changes: { action?: 'cancel' | 'modify'; status?: 'scheduled' | 'completed' }) {
    return item.override_id
      ? saveOverride.mutateAsync({ id: item.override_id, input: changes })
      : saveOverride.mutateAsync({ input: { schedule_template_id: item.template_id, date: item.date, action: 'modify', ...changes } })
  }

  /** An override that no longer changes anything is removed instead of kept around. */
  function clearOverride(item: RecurringTimelineItem, changes: { action: 'modify'; status: 'scheduled' }) {
    return item.override_id && !item.is_modified ? deleteOverride.mutateAsync(item.override_id) : override(item, changes)
  }

  return {
    setDone(item: TimelineItem, done: boolean) {
      const status = done ? 'completed' : 'scheduled'
      const action =
        item.source === 'manual'
          ? scheduleStatus.mutateAsync({ id: item.schedule_id, status })
          : done
            ? override(item, { status: 'completed' })
            : clearOverride(item, { action: 'modify', status: 'scheduled' })

      return withToast(action, done ? 'Marked as done.' : 'Marked as not done.')
    },

    cancel(item: TimelineItem) {
      const action =
        item.source === 'manual'
          ? scheduleStatus.mutateAsync({ id: item.schedule_id, status: 'cancelled' })
          : override(item, { action: 'cancel' })

      return withToast(action, item.source === 'manual' ? 'Schedule cancelled.' : 'Skipped for this day.')
    },

    restore(item: TimelineItem) {
      const action =
        item.source === 'manual'
          ? scheduleStatus.mutateAsync({ id: item.schedule_id, status: 'scheduled' })
          : clearOverride(item, { action: 'modify', status: 'scheduled' })

      return withToast(action, 'Restored.')
    },

    /** Drop this day's changes and follow the weekly routine again. */
    resetToRoutine(item: RecurringTimelineItem) {
      if (!item.override_id) return Promise.resolve()
      return withToast(deleteOverride.mutateAsync(item.override_id), 'Back to the weekly routine.')
    },

    remove(item: ManualTimelineItem) {
      return withToast(deleteSchedule.mutateAsync(item.schedule_id), 'Schedule deleted.')
    },
  }
}
