import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

/**
 * Protege rutas según autenticación y rol.
 *
 * Props:
 *   adminOnly — solo admins pueden entrar  (ej: /admin)
 *   userOnly  — solo usuarios pueden entrar (ej: /dashboard)
 *               si un admin intenta entrar, lo manda a /admin
 *
 * Ejemplos de uso en AppRouter:
 *   <ProtectedRoute><Profile /></ProtectedRoute>           ← cualquier logueado
 *   <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
 *   <ProtectedRoute userOnly><Dashboard /></ProtectedRoute>
 */
function ProtectedRoute({ children, adminOnly = false, userOnly = false }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // No logueado → manda a login guardando la ruta de origen
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Ruta solo para admins y no lo es → acceso denegado
  if (adminOnly && user?.rol !== 'Admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Ruta solo para usuarios y es admin → manda a su panel
  if (userOnly && user?.rol === 'Admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedRoute;