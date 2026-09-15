import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '@/store/useAuthStore'

interface Props {
  children: React.ReactNode
  adminOnly?: boolean
  userOnly?: boolean
}

function ProtectedRoute({ children, adminOnly = false, userOnly = false }: Props) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} replace />

  if (adminOnly && user?.rol !== 'Admin')
    return <Navigate to="/unauthorized" replace />

  if (userOnly && user?.rol === 'Admin')
    return <Navigate to="/admin" replace />

  return <>{children}</>
}

export default ProtectedRoute