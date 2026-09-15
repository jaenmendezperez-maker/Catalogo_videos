// src/router/AppRouter.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'

// Auth
import Login from '../pages/auth/Login'
import Registro from '../pages/auth/Registro'

// Públicas
import Home from '../pages/Home'
import Especialidades from '../pages/Especialidades'
import Instructores from '../pages/Instructores'
import AcercaDe from '../pages/AcercaDe'
import Contacto from '../pages/Contacto'

// Cursos
import CursosCatalogo from '../pages/cursos/CursosCatalogo'
import CursoDetalle from '../pages/cursos/CursoDetalle'

// Usuario
import Dashboard from '../pages/user/Dashboard'
import MyCourses from '../pages/user/MyCourses'
import Profile from '../pages/user/Profile'

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard'
import ManageUsers from '../pages/admin/ManageUsers'
import ManageCourses from '../pages/admin/ManageCourses'
import EditCourse from '../pages/admin/EditCourse'
// CreateCourse y CreateVideo ya no son páginas — ahora son modales
// (NewCourseModal / NewVideoModal) que se abren desde AdminDashboard y ManageCourses.

// Errores
import NotFound from '../pages/errors/NotFound'
import Unauthorized from '../pages/errors/Unauthorized'

// Precios
import Precios from '../pages/Precios'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>

          {/* ── Públicas ── */}
          <Route index element={<Home />} />
          <Route path="login"         element={<Login />} />
          <Route path="registro"      element={<Registro />} />
          <Route path="cursos"        element={<CursosCatalogo />} />
          <Route path="cursos/:id"    element={<CursoDetalle />} />
          <Route path="especialidades"element={<Especialidades />} />
          <Route path="instructores"  element={<Instructores />} />
          <Route path="acerca"        element={<AcercaDe />} />
          <Route path="contacto"      element={<Contacto />} />
          <Route path="precios"       element={<Precios />} />

          {/* ── Páginas legales (placeholders) ── */}
          <Route path="privacidad" element={
            <div className="bg-[#f8f9ff] min-h-screen flex items-center justify-center">
              <p className="text-[#45464d] text-sm">Política de privacidad — próximamente</p>
            </div>
          } />
          <Route path="terminos" element={
            <div className="bg-[#f8f9ff] min-h-screen flex items-center justify-center">
              <p className="text-[#45464d] text-sm">Términos de uso — próximamente</p>
            </div>
          } />

          {/* ── Usuario [userOnly] ── */}
          <Route path="dashboard" element={
            <ProtectedRoute userOnly><Dashboard /></ProtectedRoute>
          } />
          <Route path="mis-cursos" element={
            <ProtectedRoute userOnly><MyCourses /></ProtectedRoute>
          } />
          <Route path="perfil" element={
            <ProtectedRoute userOnly><Profile /></ProtectedRoute>
          } />

          {/* ── Admin [adminOnly] ── */}
          <Route path="admin" element={
            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="admin/usuarios" element={
            <ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>
          } />
          <Route path="admin/cursos" element={
            <ProtectedRoute adminOnly><ManageCourses /></ProtectedRoute>
          } />
          <Route path="admin/cursos/:id/editar" element={
            <ProtectedRoute adminOnly><EditCourse /></ProtectedRoute>
          } />
          {/* admin/cursos/nuevo y admin/videos/nuevo eliminadas: ahora son modales */}

          {/* ── Errores ── */}
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="*"            element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter