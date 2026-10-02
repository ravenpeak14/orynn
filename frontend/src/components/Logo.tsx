import { useId } from 'react'
import { cn } from '../lib/cn'

/** The Orynn mark: a day as a ring, with a node on it. Same art as public/logo.svg. */
export function LogoMark({ className }: { className?: string }) {
  const id = useId()
  const gradient = `${id}-bg`
  const mask = `${id}-gap`

  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8E80F2" />
          <stop offset="1" stopColor="#6557D8" />
        </linearGradient>
        <mask id={mask}>
          <rect width="512" height="512" fill="#fff" />
          <circle cx="339.4" cy="172.6" r="54" fill="#000" />
        </mask>
      </defs>
      <rect width="512" height="512" rx="116" fill={`url(#${gradient})`} />
      <circle cx="256" cy="256" r="118" fill="none" stroke="#fff" strokeWidth="40" mask={`url(#${mask})`} />
      <circle cx="339.4" cy="172.6" r="28" fill="#fff" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className="size-8" />
      <span className="text-xl font-bold tracking-tight">Orynn</span>
    </span>
  )
}
