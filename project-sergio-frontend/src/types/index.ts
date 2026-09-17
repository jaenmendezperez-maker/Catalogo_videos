// src/types/index.ts

// ── Auth ─────────────────────────────────────────────────

export type Rol = 'Admin' | 'Usuario' | 'Educador'

export interface LoginPayload {
  correo: string
  contrasena: string
}

export interface RegisterPayload {
  nombre: string
  correo: string
  contrasena: string
  telefono?: string
}

// Respuesta real de /login y /registro
export interface UsuarioAutenticadoDto {
  id: number
  nombre: string
  correo: string
  telefono: string | null
  fotoPerfil: string | null
  rol: Rol
  esPremium: boolean
  token: string
  refreshToken: string
  fechaExpiracion: string
}

// Respuesta real de /refresh (nombres distintos, no es el mismo DTO)
export interface RefreshResponseDto {
  accessToken: string
  refreshToken: string
  fechaExpiracion: string
}

// ── Usuarios ─────────────────────────────────────────────

// GET /api/usuarios/perfil
export interface PerfilDto {
  id: number
  nombre: string
  correo: string
  telefono: string | null
  fotoPerfil: string | null
  esPremium: boolean
  fechaVencimientoPremium: string | null
  fechaRegistro: string
}

// Fila de GET /api/usuarios (admin) — ajusta si el backend expone más campos
export interface UsuarioListadoDto {
  id: number
  nombre: string
  correo: string
  telefono: string | null
  fotoPerfil: string | null
  rol: Rol
  esPremium: boolean
}

// PUT /api/usuarios/perfil — todo opcional
export interface ActualizarPerfilDto {
  nombre?: string
  correo?: string
  telefono?: string
  fotoPerfil?: string
}

// PUT /api/usuarios/{id} — como perfil + rolId (solo Admin)
export interface ActualizarUsuarioDto extends ActualizarPerfilDto {
  rolId?: 1 | 2 | 3
}

// ── Cursos ───────────────────────────────────────────────
// Backend: VideoCursoVistasPreviaDto / VideoCursoDetalleDto
// (serializados en camelCase por ASP.NET)

export interface CursoVistasPreviaDto {
  id: number
  nombre: string
  esPremium: boolean
  cantidadVideos: number   // denormalizado — NO se actualiza tras el alta (ver 04-decisiones-de-diseno.md)
  tamanoTotal: number      // en bytes, mismo caveat
}

export interface CursoDetalleDto extends CursoVistasPreviaDto {
  videos: VideoVistasPreviaDto[] // limitado a los 50 más recientes, filtrados por esPublico salvo Admin
}

// Payloads de escritura (Admin)
export interface CrearCursoDto {
  nombre: string       // requerido, max 200
  esPremium: boolean   // requerido
}

export interface ActualizarCursoDto {
  nombre?: string
  esPremium?: boolean
}

// ── Videos ───────────────────────────────────────────────
// Backend: SergioApi.Models.DTOs.Videos.*

export type StatusVideo = number
  // TODO: confirmar los valores reales del enum en Enums/StatusVideo.cs
  // Backend dice: 0-10, y NUNCA se actualiza (falta el webhook de Bunny) —
  // en la práctica hoy siempre vas a recibir 0.

export interface VideoSubtituloResponseDto {
  // TODO: confirmar shape real, no vino en el documento — estimado por 01-modelo-de-datos.md
  id: number
  srclang: string
  label: string
  version: number
}

// SALIDA — listados públicos (GET /api/videos, /api/videos/coleccion/{id})
export interface VideoVistasPreviaDto {
  id: number
  titulo: string
  descripcion: string | null
  thumbnailUrl: string | null
  thumbnailBlurhash: string | null
  duracionSegundos: number
  esPremium: boolean
  esPublico: boolean
  status: number // StatusVideo — siempre 0 hoy, webhook de Bunny sin implementar
  progresoEncoding: number
  vistas: number
  categoria: string | null
  nombreColeccion: string | null
}

// SALIDA — detalle Admin (no confirmado en qué endpoint se expone tal cual;
// probablemente el GET /api/videos/{id} para Admin, o interno)
export interface VideoDetalleDto {
  id: number
  titulo: string
  descripcion: string | null
  categoria: string | null
  esPremium: boolean
  esPublico: boolean
  videoCursoId: number | null
  nombreColeccion: string | null
  status: number
  progresoEncoding: number
  resolucionesDisponibles: string | null
  codecsOutput: string | null
  jitEncodingHabilitado: boolean | null
  estadoSmartGenerate: number
  duracionSegundos: number
  ancho: number
  alto: number
  framerate: number
  rotacion: number | null
  almacenamientoTamano: number
  thumbnailUrl: string | null
  cantidadThumbnails: number
  thumbnailBlurhash: string | null
  tieneMP4Fallback: boolean
  tieneOriginal: boolean | null
  hashOriginal: string | null
  tienePreviewAltaCalidad: boolean | null
  transcripcionHabilitada: boolean
  subtitulos: VideoSubtituloResponseDto[]
  fechaSubida: string // DateTimeOffset → ISO string en JSON
}

// SALIDA — GET /api/videos/{id}/estadisticas (solo Admin, incluye bunnyVideoId)
export interface VideoEstadisticasDto {
  id: number
  bunnyVideoId: string
  titulo: string
  vistas: number
  tiempoPromedioVista: number
  tiempoTotalVista: number
  almacenamientoTamano: number
  status: number
  progresoEncoding: number
  fechaSubida: string
}

// SALIDA — GET /api/videos/{id}/reproducir (JWT requerido)
export interface VideoReproduccionDto {
  id: number
  titulo: string
  url: string
  expiraEn: string
  duracionSegundos: number
  esPremium: boolean
  resolucionesDisponibles: string | null
  subtitulos: VideoSubtituloResponseDto[]
}

// ENTRADA — POST /api/videos (multipart/form-data + archivo)
export interface CrearVideoDto {
  titulo: string
  descripcion?: string
  esPremium: boolean
  esPublico: boolean
  videoCursoId?: number
  categoria?: string
  // + "archivo": File, se manda aparte en el FormData
}

// ENTRADA — PUT /api/videos/{id}, todo opcional
export interface ActualizarVideoDto {
  titulo?: string
  descripcion?: string
  esPremium?: boolean
  esPublico?: boolean
  videoCursoId?: number
  categoria?: string
}

// ── Paginación genérica ──────────────────────────────────

export interface PaginatedResponse<T> {
  datos: T[]
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
  haySiguiente: boolean
  hayAnterior: boolean
}

// ── Errores del backend ──────────────────────────────────

export interface ApiErrorResponse {
  exito: false
  mensaje: string
  codigo: number
  traceId: string
  errores?: Record<string, string[]>
}

// ── UI ───────────────────────────────────────────────────
// Tipo de la UI, no viene del backend

export interface AlertState {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}