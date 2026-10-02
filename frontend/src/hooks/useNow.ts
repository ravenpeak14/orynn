import { useMemo, useSyncExternalStore } from 'react'
import { nowIn, type ZonedNow } from '../lib/date'

// One shared clock with minute resolution: components re-render only when the
// minute changes, and immediately when the app comes back to the foreground.
function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 15_000)
  document.addEventListener('visibilitychange', onChange)

  return () => {
    window.clearInterval(timer)
    document.removeEventListener('visibilitychange', onChange)
  }
}

const currentMinute = () => Math.floor(Date.now() / 60_000)

/** "Today" and the current time of day in the user's timezone. */
export function useNow(timeZone: string): ZonedNow {
  const minute = useSyncExternalStore(subscribe, currentMinute)

  return useMemo(() => nowIn(timeZone, minute * 60_000), [timeZone, minute])
}
