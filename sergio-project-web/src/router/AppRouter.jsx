/* src/router/AppRouter.jsx
/                        → Home.jsx
/login                   → Login.jsx
/registro                → Registro.jsx
/cursos                  → CursosCatalogo.jsx
/cursos/:id              → CursoDetalle.jsx
/dashboard               → Dashboard.jsx        [requiere login]
/mis-cursos              → MyCourses.jsx        [requiere login]
/perfil                  → Profile.jsx          [requiere login]
/admin                   → AdminDashboard.jsx   [requiere rol Admin]
/admin/usuarios          → ManageUsers.jsx      [requiere rol Admin]
/admin/cursos            → ManageCourses.jsx    [requiere rol Admin]
/admin/cursos/nuevo      → CreateCourse.jsx     [requiere rol Admin]
/admin/cursos/:id/editar → EditCourse.jsx       [requiere rol Admin]
/                        → NotFound.jsx */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import CursosCatalogo from '../pages/cursos/CursosCatalogo';
import AdminDashboard from '../pages/admin/AdminDashboard';
import NotFound from '../pages/errors/NotFound';
// ...más imports

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cursos" element={<CursosCatalogo />} />
        
        {/* Rutas protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        
        {/* Rutas solo Admin */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;