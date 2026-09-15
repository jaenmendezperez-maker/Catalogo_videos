// src/utils/constants.ts
// Constantes globales del proyecto.
// Importa desde aquí en vez de hardcodear strings en los componentes.

import type { CategoriaCurso, NivelCurso, SelectOption } from '../types'

// ── App ────────────────────────────────────────────────────

export const APP_NAME    = import.meta.env.VITE_APP_NAME || 'MedicusLearn'
export const API_URL     = import.meta.env.VITE_API_URL

// ── Roles ──────────────────────────────────────────────────

export const ROLES = {
  ADMIN:   'Admin',
  USUARIO: 'Usuario',
} as const

// ── Categorías de cursos ───────────────────────────────────

export const CATEGORIAS: CategoriaCurso[] = [
  'Cardiología',
  'Neurología',
  'Pediatría',
  'Urgencias',
  'Cirugía',
  'Oncología',
  'Psiquiatría',
  'Ginecología',
]

export const CATEGORIAS_OPTIONS: SelectOption[] = CATEGORIAS.map(c => ({
  value: c,
  label: c,
}))

// ── Niveles de cursos ──────────────────────────────────────

export const NIVELES: NivelCurso[] = ['Básico', 'Intermedio', 'Avanzado']

export const NIVELES_OPTIONS: SelectOption[] = NIVELES.map(n => ({
  value: n,
  label: n,
}))

// ── Colores por categoría (para UI) ───────────────────────

export const CATEGORIA_ESTILOS: Record<CategoriaCurso, {
  icono:  string
  acento: string
  color:  string
}> = {
  Cardiología: { icono: '/assets/images/heart.png', acento: 'text-rose-400',    color: 'from-rose-500/20 to-rose-600/5'     },
  Neurología:  { icono: '/assets/images/brain.png', acento: 'text-violet-400',  color: 'from-violet-500/20 to-violet-600/5' },
  Pediatría:   { icono: '/assets/images/baby.png', acento: 'text-emerald-400', color: 'from-emerald-500/20 to-emerald-600/5'},
  Urgencias:   { icono: '/assets/images/ambulance.png', acento: 'text-orange-400',  color: 'from-orange-500/20 to-orange-600/5' },
  Cirugía:     { icono: '/assets/images/surgery-room.png', acento: 'text-blue-400',    color: 'from-blue-500/20 to-blue-600/5'     },
  Oncología:   { icono: '/assets/images/cancer-cell.png', acento: 'text-pink-400',    color: 'from-pink-500/20 to-pink-600/5'     },
  Psiquiatría: { icono: '/assets/images/mental-health.png', acento: 'text-indigo-400',  color: 'from-indigo-500/20 to-indigo-600/5' },
  Ginecología: { icono: '/assets/images/uterus.png', acento: 'text-teal-400',    color: 'from-teal-500/20 to-teal-600/5'     },
}

// ── Colores por nivel (para badges) ───────────────────────

export const NIVEL_ESTILOS: Record<NivelCurso, string> = {
  'Básico':      'bg-emerald-400/10 text-emerald-400',
  'Intermedio':  'bg-amber-400/10   text-amber-400',
  'Avanzado':    'bg-rose-400/10    text-rose-400',
}

// ── Paginación ─────────────────────────────────────────────

export const PAGE_SIZE_DEFAULT = 10

// ── Rutas (evita strings hardcodeados en el código) ────────

export const ROUTES = {
  HOME:             '/',
  LOGIN:            '/login',
  REGISTRO:         '/registro',
  CURSOS:           '/cursos',
  CURSO_DETALLE:    (id: number) => `/cursos/${id}`,
  DASHBOARD:        '/dashboard',
  MIS_CURSOS:       '/mis-cursos',
  PERFIL:           '/perfil',
  ADMIN:            '/admin',
  ADMIN_USUARIOS:   '/admin/usuarios',
  ADMIN_CURSOS:     '/admin/cursos',
  ADMIN_CURSO_NUEVO:'/admin/cursos/nuevo',
  ADMIN_CURSO_EDIT: (id: number) => `/admin/cursos/${id}/editar`,
  ADMIN_VIDEO_NUEVO:'/admin/videos/nuevo',
  UNAUTHORIZED:     '/unauthorized',
} as const