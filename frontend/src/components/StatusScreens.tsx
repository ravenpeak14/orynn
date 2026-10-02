import { RotateCcw } from 'lucide-react'
import { BackgroundGlow } from './BackgroundGlow'
import { LogoMark } from './Logo'
import { Button } from './ui'

export function SplashScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status" aria-label="Loading Orynn">
      <BackgroundGlow />
      <LogoMark className="size-14 animate-pulse" />
    </div>
  )
}

export function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <BackgroundGlow />
      <LogoMark className="size-14" />
      <p className="mt-6 text-lg font-semibold">Orynn couldn't load</p>
      <p className="mt-1 max-w-xs text-[15px] text-ink-muted">{message}</p>
      <Button className="mt-6" variant="secondary" icon={<RotateCcw />} onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
