import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Pages — Auth
import Login from '../pages/auth/Login';
import Registro from '../pages/auth/Registro';

// Pages — Públicas
import Home from '../pages/Home';

// Pages — Usuario (requieren login)
import Dashboard from '../pages/user/Dashboard';
import MyCourses from '../pages/user/MyCourses';
import Profile from '../pages/user/Profile';

// Pages — Admin (requieren rol Admin)
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageCourses from '../pages/admin/ManageCourses';
import CreateCourse from '../pages/admin/CreateCourse';
import EditCourse from '../pages/admin/EditCourse';
import CreateVideo from '../pages/admin/CreateVideo';

// Pages — Cursos
import CursosCatalogo from '../pages/cursos/CursosCatalogo';
import CursoDetalle from '../pages/cursos/CursoDetalle';

// Pages — Errores
import NotFound from '../pages/errors/NotFound';
import Unauthorized from '../pages/errors/Unauthorized';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Layout global: envuelve TODAS las rutas */}
        <Route path="/" element={<Layout />}>

          {/* ── Públicas ── */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Registro />} />
          <Route path="cursos" element={<CursosCatalogo />} />
          <Route path="cursos/:id" element={<CursoDetalle />} />

          {/* ── Usuario autenticado ── */}
          <Route path="dashboard" element={
            <ProtectedRoute userOnly><Dashboard /></ProtectedRoute>
          } />
          <Route path="mis-cursos" element={
            <ProtectedRoute userOnly><MyCourses /></ProtectedRoute>
          } />
          <Route path="perfil" element={
            <ProtectedRoute userOnly><Profile /></ProtectedRoute>
          } />

          {/* ── Admin ── */}
          <Route path="admin" element={
            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="admin/usuarios" element={
            <ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>
          } />
          <Route path="admin/cursos" element={
            <ProtectedRoute adminOnly><ManageCourses /></ProtectedRoute>
          } />
          <Route path="admin/cursos/nuevo" element={
            <ProtectedRoute adminOnly><CreateCourse /></ProtectedRoute>
          } />
          <Route path="admin/cursos/:id/editar" element={
            <ProtectedRoute adminOnly><EditCourse /></ProtectedRoute>
          } />
          <Route path="admin/videos/nuevo" element={
            <ProtectedRoute adminOnly><CreateVideo /></ProtectedRoute>
          } />

          {/* ── Errores ── */}
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;