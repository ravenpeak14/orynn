import { useSyncExternalStore } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
}

// Chrome/Edge/Android fire this once, usually right after the page loads, so it
// is captured at startup and kept until Settings offers the install button.
let deferredPrompt: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  deferredPrompt = event as BeforeInstallPromptEvent
  notify()
})

window.addEventListener('appinstalled', () => {
  deferredPrompt = null
  notify()
})

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** True when the browser can show its own install dialog. */
export function useCanInstall(): boolean {
  return useSyncExternalStore(subscribe, () => deferredPrompt !== null)
}

export async function promptInstall(): Promise<void> {
  const prompt = deferredPrompt
  if (!prompt) return

  deferredPrompt = null
  notify()
  await prompt.prompt()
}

export function isInstalled(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches
}

export function isIos(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent)
}
