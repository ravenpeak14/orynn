import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, api } from '../../lib/api'
import { meKey } from '../../lib/queryClient'
import { useApiMutation } from '../../lib/useApiMutation'
import type { User } from '../../types/api'

async function fetchMe(): Promise<User | null> {
  try {
    return (await api.get<User>('/me')).data
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

/** The signed-in user, or null for guests. */
export function useMe() {
  return useQuery({ queryKey: meKey, queryFn: fetchMe, staleTime: Infinity })
}

/** The signed-in user. Only use below <RequireAuth>. */
export function useUser(): User {
  const { data } = useMe()
  if (!data) throw new Error('useUser() needs a signed-in user.')

  return data
}

export interface LoginInput {
  email: string
  password: string
  remember: boolean
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  password_confirmation: string
  timezone: string
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: LoginInput) => api.post<User>('/login', input),
    onSuccess: (response) => queryClient.setQueryData(meKey, response.data),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RegisterInput) => api.post<User>('/register', input),
    onSuccess: (response) => queryClient.setQueryData(meKey, response.data),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.post<null>('/logout'),
    // Drop every cached schedule even if the request failed (e.g. already expired).
    onSettled: () => {
      queryClient.clear()
      queryClient.setQueryData(meKey, null)
    },
  })
}

export interface ProfileInput {
  name: string
  email: string
  timezone: string
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useApiMutation((input: ProfileInput) => api.put<User>('/me', input), {
    // A new timezone can change which date is "today".
    invalidate: [['timeline']],
    onSuccess: (user) => queryClient.setQueryData(meKey, user),
  })
}

export interface PasswordInput {
  current_password: string
  password: string
  password_confirmation: string
}

export function useUpdatePassword() {
  return useApiMutation((input: PasswordInput) => api.put<null>('/me/password', input))
}
