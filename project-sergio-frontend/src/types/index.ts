// src/types/index.ts

// ── Auth ───────────────────────────────────────────────────

export type Rol = 'Admin' | 'Usuario'

export interface User {
  id:             number
  nombre:         string
  correo:         string
  telefono?:      string
  rol:            Rol
  fotoPerfil?:    string | null
  estado?:        boolean
  esPremium:      boolean
  fechaRegistro?: string
  avatar?:        string
}

export interface AuthResponse {
  user:  User
  token: string
}

export interface LoginPayload {
  correo:     string
  contrasena: string
}

export interface RegisterPayload {
  nombre:     string
  correo:     string
  telefono:   string
  contrasena: string
}

// ── Cursos ─────────────────────────────────────────────────

export type NivelCurso = 'Básico' | 'Intermedio' | 'Avanzado'

export type CategoriaCurso =
  | 'Cardiología'
  | 'Neurología'
  | 'Pediatría'
  | 'Urgencias'
  | 'Cirugía'
  | 'Oncología'
  | 'Psiquiatría'
  | 'Ginecología'

export interface Curso {
  id:               number
  nombre:           string        // en .NET: Nombre
  categoria:        CategoriaCurso
  descripcion?:     string
  portadaURL?:      string
  nivel:            NivelCurso
  esPremium:        boolean
  publicado?:       boolean
  alumnos?:         number
  duracion?:        string
  videos?:          number
  instructor?:      string
  publicacionCurso?: string
}

export interface CursoDetalle extends Curso {
  instructorRol?:    string
  instructorAvatar?: string
  objetivos?:        string[]
  modulos:           Modulo[]
}

// ── Videos ─────────────────────────────────────────────────

export interface Video {
  id:               number
  titulo:           string
  descripcion?:     string
  fechaSubida?:     string
  linkEnlace:       string
  esPremium:        boolean
  oculto?:          boolean
  ordenEnSecuencia: number
  cursoId:          number
  // Helpers visuales
  duracion?:   string
  completado?: boolean
}

// ── Módulos ────────────────────────────────────────────────

export interface Modulo {
  id:     number
  titulo: string
  videos: Video[]
}

// ── Suscripción ────────────────────────────────────────────

export type EstadoSuscripcion = 'activa' | 'expirada' | 'cancelada'

export interface Suscripcion {
  id:          number
  idUsuario:   number
  fechaInicio: string
  fechaFinal:  string
  estado:      boolean
  plan?:       'mensual' | 'anual'
}

// ── API helpers ────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data:       T[]
  total:      number
  page:       number
  pageSize:   number
  totalPages: number
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

// ── UI ─────────────────────────────────────────────────────

export interface SelectOption {
  value: string
  label: string
}

export type AlertType = 'success' | 'error' | 'warning' | 'info'

export interface AlertState {
  type:    AlertType
  message: string
}