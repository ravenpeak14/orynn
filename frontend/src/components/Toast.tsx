import { CircleCheck, TriangleAlert } from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'
import { cn } from '../lib/cn'
import { ToastContext, type Toaster, type ToastKind } from './toast-context'

interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

let nextId = 0

const DURATION: Record<ToastKind, number> = { success: 2500, warning: 4000, error: 5000 }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = (id: number) => setToasts((list) => list.filter((toast) => toast.id !== id))

  const toaster = useMemo<Toaster>(() => {
    const show = (kind: ToastKind, message: string) => {
      const id = ++nextId
      setToasts((list) => [...list.slice(-2), { id, kind, message }])
      window.setTimeout(() => dismiss(id), DURATION[kind])
    }

    return {
      success: (message) => show('success', message),
      warning: (message) => show('warning', message),
      error: (message) => show('error', message),
    }
  }, [])

  return (
    <ToastContext value={toaster}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 px-4 pt-[max(env(safe-area-inset-top),12px)]"
      >
        {toasts.map((toast) => (
          <div key={toast.id} role={toast.kind === 'error' ? 'alert' : 'status'} className="pointer-events-auto w-full max-w-sm">
            {/* Tap to dismiss, so a toast never blocks the header for long. */}
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="glass flex w-full animate-toast-in items-start gap-2.5 rounded-lg bg-white/80 px-4 py-3 text-left text-sm font-medium"
            >
              {toast.kind === 'success' ? (
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-cat-green-ink" aria-hidden />
              ) : (
                <TriangleAlert
                  className={cn('mt-0.5 size-4 shrink-0', toast.kind === 'warning' ? 'text-warning' : 'text-danger')}
                  aria-hidden
                />
              )}
              <span className="flex-1">{toast.message}</span>
              <span className="sr-only">Dismiss</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  )
}
