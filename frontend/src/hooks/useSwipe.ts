import { type TouchEvent, useRef } from 'react'

/**
 * Horizontal swipe handlers. Swiping is only a shortcut: every action it
 * triggers also has a button.
 */
export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null)

  return {
    onTouchStart(event: TouchEvent) {
      const touch = event.touches[0]
      start.current = { x: touch.clientX, y: touch.clientY }
    },
    onTouchEnd(event: TouchEvent) {
      const from = start.current
      start.current = null
      if (!from) return

      const touch = event.changedTouches[0]
      const dx = touch.clientX - from.x
      const dy = touch.clientY - from.y

      // Ignore short moves and mostly-vertical scrolling.
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return

      if (dx < 0) onSwipeLeft()
      else onSwipeRight()
    },
  }
}
