import { Navigate, Outlet, useLocation } from 'react-router'
import { ErrorScreen, SplashScreen } from '../../components/StatusScreens'
import { useMe } from './api'

export function RequireAuth() {
  const me = useMe()
  const location = useLocation()

  if (me.isPending) return <SplashScreen />
  if (me.isError) return <ErrorScreen message={me.error.message} onRetry={() => me.refetch()} />
  if (!me.data) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />

  return <Outlet />
}

export function GuestOnly() {
  const me = useMe()
  const location = useLocation()

  if (me.isPending) return <SplashScreen />

  if (me.data) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? '/'} replace />
  }

  return <Outlet />
}
