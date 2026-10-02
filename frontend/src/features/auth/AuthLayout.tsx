import type { ReactNode } from 'react'
import { BackgroundGlow } from '../../components/BackgroundGlow'
import { LogoMark } from '../../components/Logo'

interface AuthLayoutProps {
  title: string
  subtitle: string
  footer: ReactNode
  children: ReactNode
}

export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <BackgroundGlow />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <LogoMark className="mx-auto size-14" />
          <p className="mt-3 text-2xl font-bold tracking-tight">Orynn</p>
          <p className="mt-1 text-sm text-ink-muted">What am I doing today, and when?</p>
        </div>

        <div className="glass rounded-sheet bg-white/65 p-6">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 mb-6 text-[15px] text-ink-muted">{subtitle}</p>
          {children}
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">{footer}</p>
      </div>
    </main>
  )
}
