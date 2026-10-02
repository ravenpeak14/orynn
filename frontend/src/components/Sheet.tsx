import { X } from 'lucide-react'
import { type ReactNode, useId, useLayoutEffect, useRef } from 'react'
import { IconButton } from './ui'

interface SheetProps {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

/**
 * A bottom sheet on phones and a centered dialog on larger screens. It is a
 * native modal <dialog>, so focus is trapped and the page behind is inert.
 * The sheet is open while it is mounted: render it conditionally.
 */
export function Sheet({ title, onClose, children, footer }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const unmounting = useRef(false)
  const titleId = useId()

  useLayoutEffect(() => {
    const dialog = ref.current
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    unmounting.current = false
    dialog?.showModal()

    return () => {
      unmounting.current = true
      dialog?.close()
      previousFocus?.focus()
    }
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // Escape: let the parent decide, so state and the dialog stay in sync.
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      // The browser can still force a close (e.g. a repeated Escape). Ignore the
      // late event from our own close() when the dialog was re-opened since
      // (React StrictMode runs effects twice in development).
      onClose={(event) => {
        if (!unmounting.current && !event.currentTarget.open) onClose()
      }}
      // A click on the dialog element itself is a click on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none animate-sheet-up overflow-y-auto overscroll-contain rounded-t-sheet bg-canvas/95 text-ink shadow-float backdrop-blur-glass backdrop:bg-black/25 sm:m-auto sm:max-w-lg sm:rounded-sheet"
    >
      <div>
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 bg-canvas/85 px-5 pt-5 pb-3 backdrop-blur-glass">
          <span aria-hidden className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-black/15 sm:hidden" />
          <h2 id={titleId} className="pt-1.5 text-lg leading-snug font-semibold">
            {title}
          </h2>
          <IconButton label="Close" onClick={onClose} className="-mr-2">
            <X className="size-5" aria-hidden />
          </IconButton>
        </header>

        <div className={footer ? 'px-5 pb-5' : 'px-5 pb-[max(env(safe-area-inset-bottom),20px)]'}>{children}</div>

        {footer && (
          <footer className="sticky bottom-0 border-t border-line bg-canvas/85 px-5 pt-3 pb-[max(env(safe-area-inset-bottom),16px)] backdrop-blur-glass">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  )
}
