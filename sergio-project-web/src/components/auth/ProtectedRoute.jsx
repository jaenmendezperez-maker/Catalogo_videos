import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

/**
 * Protege rutas que requieren autenticación.
 * 
 * Uso básico (solo login):
 *   <ProtectedRoute><Dashboard /></ProtectedRoute>
 * 
 * Uso con rol admin:
 *   <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
 */
function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // No está logueado → redirige a login guardando la ruta de origen
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Requiere admin pero no lo es → acceso denegado
  if (adminOnly && user?.rol !== 'Admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;