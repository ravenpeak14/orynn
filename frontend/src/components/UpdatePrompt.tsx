import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from './ui'

/** Asks before activating a new version, so a reload never interrupts a form. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      role="status"
      className="glass fixed inset-x-4 bottom-[calc(max(env(safe-area-inset-bottom),12px)+80px)] z-40 mx-auto flex max-w-sm items-center gap-2 rounded-lg bg-white/80 py-2 pr-2 pl-4 lg:bottom-6"
    >
      <p className="flex-1 text-sm font-medium">A new version of Orynn is ready.</p>
      <Button size="sm" variant="ghost" onClick={() => setNeedRefresh(false)}>
        Later
      </Button>
      <Button size="sm" onClick={() => updateServiceWorker(true)}>
        Reload
      </Button>
    </div>
  )
}
