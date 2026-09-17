// src/api/cursosApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'
import type {
  CursoVistasPreviaDto,
  CursoDetalleDto,
  CrearCursoDto,
  ActualizarCursoDto,
  PaginatedResponse,
} from '../types'

// ── Query Keys ─────────────────────────────────────────────

export const cursoKeys = {
  all:    ()                              => ['cursos'] as const,
  list:   (params: Record<string, unknown> = {}) => ['cursos', 'list', params] as const,
  detail: (id: number)                    => ['cursos', 'detail', id] as const,
}

// ── Fetch functions ────────────────────────────────────────

async function fetchCursos(params?: { pagina?: number; porPagina?: number }) {
  const res = await api.get<PaginatedResponse<CursoVistasPreviaDto>>('/cursos', { params })
  return res.data
}

async function fetchCursoById(id: number): Promise<CursoDetalleDto> {
  const res = await api.get<CursoDetalleDto>(`/cursos/${id}`)
  return res.data
}

async function createCurso(data: CrearCursoDto): Promise<CursoDetalleDto> {
  const res = await api.post<CursoDetalleDto>('/cursos', data)
  return res.data
}

async function updateCurso(id: number, data: ActualizarCursoDto): Promise<CursoDetalleDto> {
  const res = await api.put<CursoDetalleDto>(`/cursos/${id}`, data)
  return res.data
}

async function deleteCurso(id: number): Promise<void> {
  await api.delete(`/cursos/${id}`)
}

// ── Hooks ──────────────────────────────────────────────────

/** Lista paginada de cursos (público) */
export function useCursos(params?: { pagina?: number; porPagina?: number }) {
  return useQuery({
    queryKey: cursoKeys.list(params),
    queryFn: () => fetchCursos(params),
  })
}

/** Detalle de un curso, con hasta 50 videos anidados */
export function useCurso(id: number) {
  return useQuery({
    queryKey: cursoKeys.detail(id),
    queryFn: () => fetchCursoById(id),
    enabled: !!id,
  })
}

/** Crear curso — Admin. NO es multipart, es solo { nombre, esPremium } */
export function useCreateCurso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createCurso,
    onSuccess: () => qc.invalidateQueries({ queryKey: cursoKeys.all() }),
  })
}

/** Editar curso — Admin */
export function useUpdateCurso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarCursoDto }) =>
      updateCurso(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: cursoKeys.detail(id) })
      qc.invalidateQueries({ queryKey: cursoKeys.all() })
    },
  })
}

/** Eliminar curso — Admin. NO borra sus videos, quedan sueltos (SET NULL) */
export function useDeleteCurso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteCurso,
    onSuccess: () => qc.invalidateQueries({ queryKey: cursoKeys.all() }),
  })
}