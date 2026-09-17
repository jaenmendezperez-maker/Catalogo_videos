// src/api/usuariosApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'
import type {
  PerfilDto,
  UsuarioListadoDto,
  ActualizarPerfilDto,
  ActualizarUsuarioDto,
  PaginatedResponse,
} from '../types'

// ── Query Keys ─────────────────────────────────────────────

export const usuarioKeys = {
  all:    ()                              => ['usuarios'] as const,
  list:   (params: Record<string, unknown> = {}) => ['usuarios', 'list', params] as const,
  detail: (id: number)                    => ['usuarios', 'detail', id] as const,
  detalleAdmin: (id: number)              => ['usuarios', 'detalle', id] as const,
  perfil: ()                              => ['usuarios', 'perfil'] as const,
}

// ── Fetch functions ────────────────────────────────────────

async function fetchUsuarios(params?: { pagina?: number; porPagina?: number }) {
  const res = await api.get<PaginatedResponse<UsuarioListadoDto>>('/usuarios', { params })
  return res.data
}

async function fetchUsuarioById(id: number): Promise<UsuarioListadoDto> {
  const res = await api.get<UsuarioListadoDto>(`/usuarios/${id}`)
  return res.data
}

async function fetchDetalleAdmin(id: number) {
  // incluye historialSuscripciones y contadores — hoy siempre vacíos (módulo pendiente)
  const res = await api.get(`/usuarios/${id}/detalle`)
  return res.data
}

async function fetchPerfil(): Promise<PerfilDto> {
  const res = await api.get<PerfilDto>('/usuarios/perfil')
  return res.data
}

async function updateUsuario(id: number, data: ActualizarUsuarioDto): Promise<void> {
  // rolId inexistente devuelve 400; rolId aquí SÍ se aplica (a diferencia de /perfil)
  await api.put(`/usuarios/${id}`, data)
}

async function updatePerfil(data: ActualizarPerfilDto): Promise<void> {
  // cambiar correo revoca TODAS las sesiones; rolId enviado aquí se ignora
  await api.put('/usuarios/perfil', data)
}

async function deleteUsuario(id: number): Promise<void> {
  // 400 si es tu propia cuenta o tiene rol Admin
  // 409 si tiene suscripción viva o cobros registrados
  await api.delete(`/usuarios/${id}`)
}

// ── Hooks ──────────────────────────────────────────────────

/** Lista paginada de usuarios — Admin */
export function useUsuarios(params?: { pagina?: number; porPagina?: number }) {
  return useQuery({
    queryKey: usuarioKeys.list(params),
    queryFn: () => fetchUsuarios(params),
  })
}

/** Detalle simple de un usuario — Admin */
export function useUsuario(id: number) {
  return useQuery({
    queryKey: usuarioKeys.detail(id),
    queryFn: () => fetchUsuarioById(id),
    enabled: !!id,
  })
}

/** Detalle extendido con historial de suscripciones — Admin (hoy siempre vacío) */
export function useDetalleUsuarioAdmin(id: number) {
  return useQuery({
    queryKey: usuarioKeys.detalleAdmin(id),
    queryFn: () => fetchDetalleAdmin(id),
    enabled: !!id,
  })
}

/** Perfil propio del usuario autenticado */
export function usePerfil() {
  return useQuery({
    queryKey: usuarioKeys.perfil(),
    queryFn: fetchPerfil,
    retry: false,
  })
}

/** Editar cualquier usuario (incluye rolId) — Admin */
export function useUpdateUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarUsuarioDto }) =>
      updateUsuario(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: usuarioKeys.detail(id) })
      qc.invalidateQueries({ queryKey: usuarioKeys.all() })
    },
  })
}

/** Editar perfil propio. Si incluye correo, invalida sesión (el usuario deberá re-loguear) */
export function useUpdatePerfil() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updatePerfil,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usuarioKeys.perfil() })
    },
  })
}

/** Eliminar usuario — Admin */
export function useDeleteUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteUsuario,
    onSuccess: () => qc.invalidateQueries({ queryKey: usuarioKeys.all() }),
  })
}