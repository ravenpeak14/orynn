import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useApiMutation } from '../../lib/useApiMutation'
import type { OverrideInput, Schedule, ScheduleInput, ScheduleOverride, ScheduleStatus, Timeline } from '../../types/api'

export const timelineKey = (date: string) => ['timeline', date] as const

const affected = [['timeline']]

/** The resolved day: weekly routine + overrides + one-off schedules + free time. */
export function useTimeline(date: string) {
  return useQuery({
    queryKey: timelineKey(date),
    queryFn: async () => (await api.get<Timeline>(`/timeline?date=${date}`)).data,
  })
}

export function useSaveSchedule() {
  return useApiMutation(
    ({ id, input }: { id?: number; input: ScheduleInput }) =>
      id ? api.put<Schedule>(`/schedules/${id}`, input) : api.post<Schedule>('/schedules', input),
    { invalidate: affected },
  )
}

export function useDeleteSchedule() {
  return useApiMutation((id: number) => api.delete(`/schedules/${id}`), { invalidate: affected, toastSuccess: false })
}

export function useScheduleStatus() {
  return useApiMutation(
    ({ id, status }: { id: number; status: ScheduleStatus }) => api.patch<Schedule>(`/schedules/${id}/status`, { status }),
    { invalidate: affected, toastSuccess: false },
  )
}

/** Create an override for one occurrence, or update the existing one. */
export function useSaveOverride({ toastSuccess = true } = {}) {
  return useApiMutation(
    ({ id, input }: { id?: number; input: OverrideInput }) =>
      id
        ? api.patch<ScheduleOverride>(`/schedule-overrides/${id}`, input)
        : api.post<ScheduleOverride>('/schedule-overrides', input),
    { invalidate: affected, toastSuccess },
  )
}

export function useDeleteOverride() {
  return useApiMutation((id: number) => api.delete(`/schedule-overrides/${id}`), {
    invalidate: affected,
    toastSuccess: false,
  })
}
