import { CalendarDays, Repeat, Settings } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { useUser } from '../features/auth/api'
import { cn } from '../lib/cn'
import { BackgroundGlow } from './BackgroundGlow'
import { Logo } from './Logo'

const NAVIGATION = [
  { to: '/', label: 'Today', icon: CalendarDays, end: true },
  { to: '/weekly', label: 'Weekly', icon: Repeat, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

/**
 * Mobile: single column with a floating bottom navigation.
 * Desktop: the same content, centered, with a sidebar.
 */
export function AppShell() {
  const user = useUser()

  return (
    <div className="min-h-dvh">
      <BackgroundGlow />

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-line bg-white/40 px-5 py-8 backdrop-blur-glass lg:flex">
        <Logo className="px-2" />
        <nav aria-label="Main" className="mt-10 flex flex-col gap-1">
          {NAVIGATION.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex h-11 items-center gap-3 rounded-full px-4 text-[15px] font-medium transition',
                  isActive ? 'bg-accent-soft text-accent-strong' : 'text-ink-muted hover:bg-black/5 hover:text-ink',
                )
              }
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-auto truncate px-2 text-sm text-ink-muted">
          Signed in as <span className="font-medium text-ink">{user.name}</span>
        </p>
      </aside>

      <main className="px-4 pt-[max(env(safe-area-inset-top),16px)] pb-40 lg:pb-16 lg:pl-64">
        <div className="mx-auto w-full max-w-xl lg:max-w-2xl lg:px-8 lg:pt-6">
          <Outlet />
        </div>
      </main>

      <nav
        aria-label="Main"
        className="glass fixed inset-x-4 bottom-[max(env(safe-area-inset-bottom),12px)] z-30 mx-auto flex h-16 max-w-sm items-center justify-around rounded-full bg-white/70 px-2 lg:hidden"
      >
        {NAVIGATION.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex h-12 min-w-20 flex-col items-center justify-center gap-0.5 rounded-full px-3 text-[11px] font-semibold transition',
                isActive ? 'bg-accent-soft text-accent-strong' : 'text-ink-muted',
              )
            }
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
