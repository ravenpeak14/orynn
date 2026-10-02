import { createContext, useContext } from 'react'

export type ToastKind = 'success' | 'warning' | 'error'

export interface Toaster {
  success(message: string): void
  warning(message: string): void
  error(message: string): void
}

export const ToastContext = createContext<Toaster | null>(null)

export function useToast(): Toaster {
  const toaster = useContext(ToastContext)
  if (!toaster) throw new Error('useToast() must be used inside <ToastProvider>.')

  return toaster
}
