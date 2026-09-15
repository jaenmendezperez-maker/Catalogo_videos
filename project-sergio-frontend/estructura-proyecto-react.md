project-sergio-frontend/
├── public/
│   └── favicon.ico
│
├── .env                          ← Variables de entorno (NO subir a git)
├── .env.production               ← Variables para producción (NO subir a git)
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
│
└── src/
    ├── api/
    │   ├── axios.ts              ← Instancia base + interceptores + refresh token
    │   ├── authApi.ts            ← Login, registro — mock + TODO para API real
    │   ├── cursosApi.ts          ← CRUD cursos + hooks de React Query
    │   ├── usuariosApi.ts        ← CRUD usuarios + hooks de React Query
    │   └── videosApi.ts          ← CRUD videos + hooks de React Query
    │
    ├── assets/
    │   ├── images/
    │   └── icons/
    │
    ├── components/
    │   ├── errors/
    │   │   └── ErrorBoundary.tsx ← Atrapa crashes globales, muestra UI amigable
    │   │
    │   ├── layout/
    │   │   ├── Navbar.tsx        ← Links distintos según rol (Admin / Usuario)
    │   │   ├── Footer.tsx        ← CTA oculto para usuarios logueados
    │   │   ├── Sidebar.tsx       ← (pendiente de usar)
    │   │   └── Layout.tsx        ← Envuelve Navbar + Outlet + Footer
    │   │
    │   ├── ui/
    │   │   ├── Alert.tsx         ← Tipos: success, error, warning, info
    │   │   ├── Badge.tsx         ← Variantes: premium, free, admin + nivel automático
    │   │   ├── Button.tsx        ← Variantes: primary, secondary, outline, danger, premium, ghost
    │   │   ├── Card.tsx          ← Con title, subtitle y prop hoverable
    │   │   ├── Input.tsx         ← Con label, error y hint integrados
    │   │   ├── Modal.tsx         ← Cierra con Escape, bloquea scroll
    │   │   ├── Spinner.tsx       ← Tamaños: sm, md, lg
    │   │   ├── UpgradeBanner.tsx ← Banner dismissible para usuarios gratuitos
    │   │   └── UpgradeModal.tsx  ← Modal al intentar ver contenido Premium bloqueado
    │   │
    │   ├── cursos/
    │   │   ├── CursoCard.tsx     ← Tarjeta reutilizable en Home y Catálogo
    │   │   ├── CursoList.tsx     ← Grid con estados loading y vacío
    │   │   └── CursoFiltros.tsx  ← Sidebar de filtros por especialidad y nivel
    │   │
    │   ├── videos/
    │   │   ├── VideoPlayer.tsx   ← Reproductor simulado (listo para URL real)
    │   │   ├── VideoList.tsx     ← Lista de videos de un módulo
    │   │   └── VideoItem.tsx     ← Ítem con estados: completado, bloqueado, activo
    │   │
    │   └── auth/
    │       └── ProtectedRoute.tsx← Props: adminOnly, userOnly
    │
    ├── hooks/
    │   ├── useAuth.ts            ← Wrapper de useAuthStore con isAdmin, isPremium, initials
    │   ├── useCursos.ts          ← Filtrado local del catálogo con estado
    │   └── useVideos.ts          ← Estado del reproductor y progreso
    │
    ├── lib/
    │   └── queryClient.ts        ← React Query: staleTime 5min, retry 1
    │
    ├── pages/
    │   ├── AcercaDe.tsx          ← /acerca
    │   ├── Contacto.tsx          ← /contacto — formulario funcional
    │   ├── Especialidades.tsx    ← /especialidades — grid de 8 especialidades
    │   ├── Home.tsx              ← Hero animado, stats con contador, cursos, testimonios
    │   ├── Instructores.tsx      ← /instructores — grid de docentes
    │   ├── Precios.tsx           ← /precios — planes Free vs Premium + FAQ
    │   │
    │   ├── auth/
    │   │   ├── Login.tsx         ← Redirige a /admin o /dashboard según rol
    │   │   └── Registro.tsx      ← Con indicador de fortaleza de contraseña
    │   │
    │   ├── cursos/
    │   │   ├── CursosCatalogo.tsx← Filtros, búsqueda, ordenamiento con useMemo
    │   │   └── CursoDetalle.tsx  ← Reproductor, módulos, UpgradeModal integrado
    │   │
    │   ├── user/
    │   │   ├── Dashboard.tsx     ← Stats, progreso, actividad, UpgradeBanner
    │   │   ├── MyCourses.tsx     ← Lista con filtro En progreso / Completados
    │   │   └── Profile.tsx       ← Editar info personal + cambiar contraseña
    │   │
    │   ├── admin/
    │   │   ├── AdminDashboard.tsx← Stats globales + accesos rápidos
    │   │   ├── ManageUsers.tsx   ← Tabla + editar en modal + eliminar con React Query
    │   │   ├── ManageCourses.tsx ← Tabla + toggle publicado + React Query
    │   │   ├── CreateCourse.tsx  ← Formulario nuevo curso + useCreateCurso
    │   │   ├── EditCourse.tsx    ← Formulario editar + useCurso + useUpdateCurso
    │   │   └── CreateVideo.tsx   ← Formulario nuevo video + useCreateVideo
    │   │
    │   └── errors/
    │       ├── NotFound.tsx      ← Página 404
    │       ├── Proximamente.tsx  ← Placeholder para secciones en construcción (/proxim)
    │       └── Unauthorized.tsx  ← Página 403
    │
    ├── router/
    │   └── AppRouter.tsx
    │
    ├── store/
    │   ├── useAuthStore.ts       ← Zustand + persist middleware
    │   └── useCursoStore.ts      ← (vacío — reservado para estado global de cursos)
    │
    ├── styles/
    │   └── global.css            ← (vacío — reservado para estilos globales futuros)
    │
    ├── types/
    │   └── index.ts              ← Fuente única de tipos: User, Curso, Video, etc.
    │
    ├── utils/
    │   ├── constants.ts          ← CATEGORIAS, NIVELES, ROUTES, CATEGORIA_ESTILOS
    │   ├── formatDate.ts         ← formatDate, formatDateTime, timeAgo, formatDuration
    │   └── validators.ts         ← validate, validateForm, passwordStrength
    │
    ├── App.tsx
    ├── main.tsx                  ← ErrorBoundary + QueryClientProvider + StrictMode
    ├── index.css
    └── vite-env.d.ts             ← Tipos para import.meta.env