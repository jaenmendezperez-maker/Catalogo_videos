// src/api/videosApi.ts
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import api from './axios'
import type {
  VideoVistasPreviaDto,
  VideoDetalleDto,
  VideoEstadisticasDto,
  VideoReproduccionDto,
  CrearVideoDto,
  ActualizarVideoDto,
  PaginatedResponse,
} from '../types'

// ── Query Keys ─────────────────────────────────────────────

export const videoKeys = {
  all:        ()                 => ['videos'] as const,
  list:       (params: Record<string, unknown> = {}) => ['videos', 'list', params] as const,
  byCurso:    (cursoId: number, params: Record<string, unknown> = {}) =>
                ['videos', 'curso', cursoId, params] as const,
  detail:     (id: number)       => ['videos', 'detail', id] as const,
  reproducir: (id: number | null) => ['videos', 'reproducir', id] as const,
  estadisticas: (id: number)     => ['videos', 'estadisticas', id] as const,
}

// ── Fetch functions ────────────────────────────────────────

async function fetchVideos(params?: { pagina?: number; porPagina?: number; busqueda?: string }) {
  const res = await api.get<PaginatedResponse<VideoVistasPreviaDto>>('/videos', { params })
  return res.data
}

async function fetchVideosByCurso(
  cursoId: number,
  params?: { pagina?: number; porPagina?: number }
) {
  // catálogo completo paginado de una colección
  const res = await api.get<PaginatedResponse<VideoVistasPreviaDto>>(
    `/videos/coleccion/${cursoId}`,
    { params }
  )
  return res.data
}

async function fetchVideoById(id: number): Promise<VideoDetalleDto> {
  const res = await api.get<VideoDetalleDto>(`/videos/${id}`)
  return res.data
}

async function fetchReproducir(id: number): Promise<VideoReproduccionDto> {
  const res = await api.get<VideoReproduccionDto>(`/videos/${id}/reproducir`)
  return res.data
}

async function fetchEstadisticas(id: number): Promise<VideoEstadisticasDto> {
  const res = await api.get<VideoEstadisticasDto>(`/videos/${id}/estadisticas`)
  return res.data
}

async function createVideo(formData: FormData): Promise<VideoDetalleDto> {
  const res = await api.post<VideoDetalleDto>('/videos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

async function updateVideo(id: number, data: ActualizarVideoDto): Promise<VideoDetalleDto> {
  const res = await api.put<VideoDetalleDto>(`/videos/${id}`, data)
  return res.data
}

async function deleteVideo(id: number): Promise<void> {
  await api.delete(`/videos/${id}`)
}

// ── Hooks ──────────────────────────────────────────────────

/** Catálogo público paginado, opcionalmente filtrado por búsqueda */
export function useVideos(params?: { pagina?: number; porPagina?: number; busqueda?: string }) {
  return useQuery({
    queryKey: videoKeys.list(params),
    queryFn: () => fetchVideos(params),
    placeholderData: keepPreviousData,
  })
}

/** Videos de una colección específica, paginado */
export function useVideosByCurso(
  cursoId: number,
  params?: { pagina?: number; porPagina?: number }
) {
  return useQuery({
    queryKey: videoKeys.byCurso(cursoId, params),
    queryFn: () => fetchVideosByCurso(cursoId, params),
    enabled: !!cursoId,
    placeholderData: keepPreviousData,
  })
}

/** Detalle de un video (Admin ve borradores; el resto, 404 si esPublico=false) */
export function useVideo(id: number) {
  return useQuery({
    queryKey: videoKeys.detail(id),
    queryFn: () => fetchVideoById(id),
    enabled: !!id,
  })
}

/**
 * URL firmada de reproducción. Requiere JWT incluso para video gratuito.
 * Solo se dispara cuando `id` deja de ser null (p.ej. al hacer click en el video).
 * No cachear como si fuera fija: caduca a las 2 horas.
 */
export function useReproducirVideo(id: number | null) {
  return useQuery({
    queryKey: videoKeys.reproducir(id),
    queryFn: () => fetchReproducir(id as number),
    enabled: !!id,
    retry: false,      // un 401/403/404 no se arregla reintentando
    staleTime: 0,
    gcTime: 0,
  })
}

/** Estadísticas — solo Admin */
export function useEstadisticasVideo(id: number) {
  return useQuery({
    queryKey: videoKeys.estadisticas(id),
    queryFn: () => fetchEstadisticas(id),
    enabled: !!id,
  })
}

/** Crear video — Admin. Espera FormData con los campos de CrearVideoDto + "archivo" */
export function useCreateVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createVideo,
    onSuccess: (video) => {
      if (video.videoCursoId) {
        qc.invalidateQueries({ queryKey: videoKeys.byCurso(video.videoCursoId) })
      }
      qc.invalidateQueries({ queryKey: videoKeys.all() })
    },
  })
}

/** Editar video — Admin. Todos los campos opcionales */
export function useUpdateVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarVideoDto }) =>
      updateVideo(id, data),
    onSuccess: (updatedVideo) => {
      qc.invalidateQueries({ queryKey: videoKeys.detail(updatedVideo.id) })
      if (updatedVideo.videoCursoId) {
        qc.invalidateQueries({ queryKey: videoKeys.byCurso(updatedVideo.videoCursoId) })
      }
      qc.invalidateQueries({ queryKey: videoKeys.all() })
    },
  })
}

/** Eliminar video — Admin */
export function useDeleteVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: number; cursoId?: number }) => deleteVideo(id),
    onSuccess: (_, { cursoId }) => {
      if (cursoId) qc.invalidateQueries({ queryKey: videoKeys.byCurso(cursoId) })
      qc.invalidateQueries({ queryKey: videoKeys.all() })
    },
  })
}