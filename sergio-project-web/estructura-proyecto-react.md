# 📁 Estructura Completa — sergio-project-web

## Árbol de carpetas

```
sergio-project-web/
├── public/
│   └── favicon.ico
│
└── src/
    ├── api/                          ← Comunicación con el backend .NET
    │   ├── axios.js                  ← Instancia base de axios (baseURL, interceptores)
    │   ├── authApi.js                ← Login, registro, logout
    │   ├── cursosApi.js              ← CRUD de cursos
    │   ├── videosApi.js              ← CRUD de videos
    │   └── usuariosApi.js            ← Gestión de usuarios
    │
    ├── assets/                       ← Imágenes, íconos, fuentes
    │   ├── images/
    │   └── icons/
    │
    ├── components/                   ← Piezas reutilizables de UI
    │   ├── layout/                   ← Estructura visual general
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── Layout.jsx            ← Envuelve Navbar + children + Footer
    │   │
    │   ├── ui/                       ← Componentes genéricos
    │   │   ├── Button.jsx
    │   │   ├── Input.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Spinner.jsx           ← Indicador de carga
    │   │   ├── Alert.jsx             ← Mensajes de éxito/error
    │   │   ├── Badge.jsx             ← Ej: "Premium", "Gratis"
    │   │   └── Card.jsx              ← Tarjeta genérica
    │   │
    │   ├── cursos/                   ← Componentes específicos de cursos
    │   │   ├── CursoCard.jsx         ← Tarjeta de un curso
    │   │   ├── CursoList.jsx         ← Lista/grilla de cursos
    │   │   └── CursoFiltros.jsx      ← Filtros por categoría
    │   │
    │   ├── videos/                   ← Componentes de video
    │   │   ├── VideoPlayer.jsx       ← Reproductor
    │   │   ├── VideoList.jsx         ← Lista de videos de un curso
    │   │   └── VideoItem.jsx         ← Ítem individual (título, duración)
    │   │
    │   └── auth/                     ← Componentes de autenticación
    │       ├── LoginForm.jsx
    │       ├── RegisterForm.jsx
    │       └── ProtectedRoute.jsx    ← Ruta que requiere login
    │
    ├── hooks/                        ← Lógica reutilizable (custom hooks)
    │   ├── useAuth.js                ← Obtener usuario logueado del store
    │   ├── useCursos.js              ← Fetch y estado de cursos
    │   └── useVideos.js              ← Fetch y estado de videos
    │
    ├── pages/                        ← Una carpeta por página/ruta
    │   ├── Home.jsx                  ← Página de inicio
    │   │
    │   ├── auth/
    │   │   ├── Login.jsx
    │   │   └── Registro.jsx
    │   │
    │   ├── cursos/
    │   │   ├── CursosCatalogo.jsx    ← /cursos — listado general
    │   │   └── CursoDetalle.jsx      ← /cursos/:id — detalle + videos
    │   │
    │   ├── user/                     ← Sección del usuario logueado
    │   │   ├── Dashboard.jsx         ← /dashboard
    │   │   ├── MyCourses.jsx         ← /mis-cursos
    │   │   └── Profile.jsx           ← /perfil
    │   │
    │   ├── admin/                    ← Panel de administración
    │   │   ├── AdminDashboard.jsx    ← /admin
    │   │   ├── ManageUsers.jsx       ← /admin/usuarios
    │   │   ├── ManageCourses.jsx     ← /admin/cursos
    │   │   ├── CreateCourse.jsx      ← /admin/cursos/nuevo
    │   │   ├── EditCourse.jsx        ← /admin/cursos/:id/editar
    │   │   └── CreateVideo.jsx       ← /admin/videos/nuevo
    │   │
    │   └── errors/
    │       ├── NotFound.jsx          ← Página 404
    │       └── Unauthorized.jsx      ← Acceso denegado
    │
    ├── router/
    │   └── AppRouter.jsx             ← Todas las rutas de la app
    │
    ├── store/                        ← Estado global (Zustand)
    │   ├── useAuthStore.js           ← Usuario, token, login/logout
    │   └── useCursoStore.js          ← Cursos cargados, filtros activos
    │
    ├── utils/                        ← Funciones de utilidad
    │   ├── formatDate.js             ← Formatear fechas
    │   ├── validators.js             ← Validar formularios
    │   └── constants.js              ← Roles, categorías, etc.
    │
    ├── styles/                       ← CSS global
    │   └── global.css
    │
    ├── App.jsx
    ├── main.jsx
    └── index.css
```

---

## 🗺️ Rutas del router

```jsx
// src/router/AppRouter.jsx
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
*                        → NotFound.jsx
```

---

## 📦 Dependencias a instalar

```bash
# Navegación entre páginas
npm install react-router-dom

# Llamadas a la API
npm install axios

# Estado global
npm install zustand

# CSS — elige UNO:
npm install tailwindcss @tailwindcss/vite   # Opción A: Tailwind
npm install bootstrap                        # Opción B: Bootstrap
```

---

## 🔑 Archivos más importantes para empezar

### 1. `src/api/axios.js` — Conexión con tu API .NET
```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7001/api',
});

// Agrega el token JWT automáticamente en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### 2. `src/store/useAuthStore.js` — Estado del usuario logueado
```js
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
```

### 3. `src/components/auth/ProtectedRoute.jsx` — Rutas privadas
```jsx
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && user?.rol !== 'Admin') return <Navigate to="/unauthorized" />;

  return children;
}

export default ProtectedRoute;
```

### 4. `src/router/AppRouter.jsx` — Rutas de la app
```jsx
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
```

### 5. `src/api/cursosApi.js` — Llamadas a tu API de cursos
```js
import api from './axios';

export const getCursos = () => api.get('/cursos');
export const getCursoById = (id) => api.get(`/cursos/${id}`);
export const createCurso = (data) => api.post('/cursos', data);
export const updateCurso = (id, data) => api.put(`/cursos/${id}`, data);
export const deleteCurso = (id) => api.delete(`/cursos/${id}`);
```

---

## 🧠 Orden de aprendizaje recomendado

1. **Semana 1** — Componentes básicos: `CursoCard`, `Navbar`, `Button`
2. **Semana 2** — Páginas con datos reales: `CursosCatalogo` consumiendo tu API
3. **Semana 3** — Autenticación: Login, registro, token JWT, rutas protegidas
4. **Semana 4** — Panel de admin: CRUD de cursos y usuarios
5. **Semana 5** — Pulir: loading states, manejo de errores, diseño responsivo

---

## ⚙️ CORS en tu API .NET (obligatorio)

Agrega esto en `Program.cs` para que React pueda conectarse:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Después de builder.Build():
app.UseCors("AllowReact");
```
