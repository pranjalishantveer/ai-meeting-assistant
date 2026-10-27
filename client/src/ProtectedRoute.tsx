import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { state } = useAuth()
  const location = useLocation()

  if (state.kind === 'loading') {
    return <div className="route-loading">Loading…</div>
  }

  if (state.kind === 'anon') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export default ProtectedRoute