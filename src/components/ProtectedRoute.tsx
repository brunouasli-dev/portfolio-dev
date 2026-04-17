import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/auth-context'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { ready, session } = useAuth()
  const location = useLocation()

  if (!ready) {
    return <div className="panel loading-panel">Carregando sessão...</div>
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
