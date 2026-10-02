import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useApiMutation } from '../../lib/useApiMutation'
import type { Category, CategoryInput } from '../../types/api'

export const categoriesKey = ['categories'] as const

// Categories appear inside timeline items and templates, so those refresh too.
const affected = [categoriesKey, ['timeline'], ['templates']]

export function useCategories() {
  return useQuery({
    queryKey: categoriesKey,
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
    staleTime: 5 * 60_000,
  })
}

export function useSaveCategory() {
  return useApiMutation(
    ({ id, input }: { id?: number; input: CategoryInput }) =>
      id ? api.put<Category>(`/categories/${id}`, input) : api.post<Category>('/categories', input),
    { invalidate: affected },
  )
}

export function useDeleteCategory() {
  return useApiMutation((id: number) => api.delete(`/categories/${id}`), { invalidate: affected })
}
