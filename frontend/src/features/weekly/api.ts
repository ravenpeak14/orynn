import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useApiMutation } from '../../lib/useApiMutation'
import type { ScheduleTemplate, TemplateInput } from '../../types/api'

export const templatesKey = ['templates'] as const

// A template change shows up on every matching date of the timeline.
const affected = [templatesKey, ['timeline']]

export function useTemplates() {
  return useQuery({
    queryKey: templatesKey,
    queryFn: async () => (await api.get<ScheduleTemplate[]>('/schedule-templates')).data,
  })
}

export function useSaveTemplate() {
  return useApiMutation(
    ({ id, input }: { id?: number; input: TemplateInput }) =>
      id
        ? api.put<ScheduleTemplate>(`/schedule-templates/${id}`, input)
        : api.post<ScheduleTemplate>('/schedule-templates', input),
    { invalidate: affected },
  )
}

export function useDeleteTemplate() {
  return useApiMutation((id: number) => api.delete(`/schedule-templates/${id}`), { invalidate: affected })
}
