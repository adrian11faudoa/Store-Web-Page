import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore.js'

export default function ProtectedRoute({ requireAdmin = false }) {
  const location = useLocation()
  const user = useAppStore(state => state.user)
  const authInitialized = useAppStore(state => state.authInitialized)

  if (!authInitialized) {
    return null
  }

  const isAuthenticated = Boolean(user)
  const role = user?.role || 'user'

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/" replace state={{ unauthorized: true }} />
  }

  return <Outlet />
}
