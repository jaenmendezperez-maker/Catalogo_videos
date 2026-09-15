// src/api/usuariosApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'
import type { User, PaginatedResponse } from '../types'

// ── Query Keys ─────────────────────────────────────────────

export const usuarioKeys = {
  all:    ()           => ['usuarios']                  as const,
  list:   (filters={}) => ['usuarios', 'list', filters] as const,
  detail: (id: number) => ['usuarios', 'detail', id]    as const,
  me:     ()           => ['usuarios', 'me']             as const,
}

// ── Mock ───────────────────────────────────────────────────

const MOCK_USUARIOS: User[] = [
  { id: 1, nombre: 'Admin Test',     correo: 'admin@test.com',      telefono: '+52 555 000 0001', rol: 'Admin',   estado: true,  esPremium: true,  fotoPerfil: null },
  { id: 2, nombre: 'Usuario Test',   correo: 'usuario@test.com',    telefono: '+52 555 000 0002', rol: 'Usuario', estado: true,  esPremium: false, fotoPerfil: null },
  { id: 3, nombre: 'Valentina Cruz', correo: 'v.cruz@mail.com',     telefono: '+52 555 111 2233', rol: 'Usuario', estado: true,  esPremium: true,  fotoPerfil: null },
  { id: 4, nombre: 'Marco Herrera',  correo: 'm.herrera@mail.com',  telefono: '+52 555 222 3344', rol: 'Usuario', estado: true,  esPremium: false, fotoPerfil: null },
  { id: 5, nombre: 'Paola Ramos',    correo: 'p.ramos@mail.com',    telefono: '+52 555 333 4455', rol: 'Admin',   estado: true,  esPremium: true,  fotoPerfil: null },
  { id: 6, nombre: 'Luis Paredes',   correo: 'l.paredes@mail.com',  telefono: '+52 555 444 5566', rol: 'Usuario', estado: false, esPremium: false, fotoPerfil: null },
  { id: 7, nombre: 'Ana Lechuga',    correo: 'a.lechuga@mail.com',  telefono: '+52 555 555 6677', rol: 'Usuario', estado: true,  esPremium: true,  fotoPerfil: null },
  { id: 8, nombre: 'Hugo Navarro',   correo: 'h.navarro@mail.com',  telefono: '+52 555 666 7788', rol: 'Usuario', estado: true,  esPremium: false, fotoPerfil: null },
]

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

// ── Fetch functions ────────────────────────────────────────

async function fetchUsuarios(): Promise<User[]> {
  await delay(500)
  // TODO: const res = await api.get<User[]>('/usuarios')
  // return res.data
  return MOCK_USUARIOS
}

async function fetchUsuarioById(id: number): Promise<User> {
  await delay(300)
  // TODO: const res = await api.get<User>(`/usuarios/${id}`)
  // return res.data
  const user = MOCK_USUARIOS.find(u => u.id === id)
  if (!user) throw new Error('Usuario no encontrado')
  return user
}

async function fetchMe(): Promise<User> {
  const res = await api.get<User>('/auth/me')
  return res.data
}

async function updateUsuario(id: number, data: Partial<User>): Promise<User> {
  const res = await api.put<User>(`/usuarios/${id}`, data)
  return res.data
}

async function updateMe(data: Partial<User>): Promise<User> {
  const res = await api.put<User>('/usuarios/me', data)
  return res.data
}

async function toggleEstado(id: number): Promise<void> {
  await api.patch(`/usuarios/${id}/estado`)
}

async function deleteUsuario(id: number): Promise<void> {
  await api.delete(`/usuarios/${id}`)
}

// ── Hooks ──────────────────────────────────────────────────

/** Lista completa de usuarios — solo admin */
export function useUsuarios() {
  return useQuery({
    queryKey: usuarioKeys.list(),
    queryFn:  fetchUsuarios,
  })
}

/** Detalle de un usuario — solo admin */
export function useUsuario(id: number) {
  return useQuery({
    queryKey: usuarioKeys.detail(id),
    queryFn:  () => fetchUsuarioById(id),
    enabled:  !!id,
  })
}

/** Usuario autenticado actual */
export function useMe() {
  return useQuery({
    queryKey: usuarioKeys.me(),
    queryFn:  fetchMe,
    // No ejecutar si no hay token (maneja la autenticación el store)
    retry: false,
  })
}

/** Editar cualquier usuario — admin */
export function useUpdateUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      updateUsuario(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: usuarioKeys.detail(id) })
      qc.invalidateQueries({ queryKey: usuarioKeys.list() })
    },
  })
}

/** Editar perfil propio — usuario logueado */
export function useUpdateMe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usuarioKeys.me() })
    },
  })
}

/** Activar / desactivar usuario — admin */
export function useToggleEstado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: toggleEstado,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usuarioKeys.list() })
    },
  })
}

/** Eliminar usuario — admin */
export function useDeleteUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteUsuario,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usuarioKeys.list() })
    },
  })
}