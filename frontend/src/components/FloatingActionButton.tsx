import { Plus } from 'lucide-react'

/** The primary "create" action, placed within thumb reach above the bottom navigation. */
export function FloatingActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="fixed right-5 bottom-[calc(max(env(safe-area-inset-bottom),12px)+80px)] z-30 flex size-14 items-center justify-center rounded-full bg-accent/95 text-white shadow-accent ring-1 ring-white/50 backdrop-blur-glass transition hover:bg-accent-strong active:scale-95 lg:right-10 lg:bottom-10"
    >
      <Plus className="size-6" strokeWidth={2.4} aria-hidden />
    </button>
  )
}
