import { type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../components/toast-context'
import type { ApiEnvelope } from './api'

interface Options<TData> {
  /** Queries to refetch before the mutation resolves. */
  invalidate?: QueryKey[]
  /** Show the API's success message as a toast (default true). */
  toastSuccess?: boolean
  onSuccess?: (data: TData) => void
}

/**
 * A mutation that refreshes the affected queries and surfaces the API's
 * messages. Errors are left to the caller, which shows them next to the form.
 */
export function useApiMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<ApiEnvelope<TData>>,
  { invalidate = [], toastSuccess = true, onSuccess }: Options<TData> = {},
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn,
    onSuccess: async (response) => {
      onSuccess?.(response.data)
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })))

      if (toastSuccess) toast.success(response.message)
      response.warnings?.forEach((warning) => toast.warning(warning))
    },
  })
}
