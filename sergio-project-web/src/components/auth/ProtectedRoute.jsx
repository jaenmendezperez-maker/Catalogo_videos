import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && user?.rol !== 'Admin') return <Navigate to="/unauthorized" />;

  return children;
}

export default ProtectedRoute;