// src/api/cursosApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'
import type { Curso, CursoDetalle } from '../types'
import { queryClient } from '@/lib/queryClient'

// ── Query Keys ─────────────────────────────────────────────

export const cursoKeys = {
  all:    ()                          => ['cursos']                  as const,
  list:   (filters: Record<string, string> = {}) => ['cursos', 'list', filters] as const,
  detail: (id: number)                => ['cursos', 'detail', id]   as const,
}

// ── Mock data ──────────────────────────────────────────────

const MOCK_CURSOS: Curso[] = [
  { id: 1,  nombre: 'Cardiología Clínica Avanzada',      categoria: 'Cardiología', nivel: 'Avanzado',   esPremium: true,  publicado: true,  alumnos: 1840, duracion: '24h', videos: 48, instructor: 'Dr. Alejandro Vega',   portadaURL: '/assets/images/heart.png'},
  { id: 2,  nombre: 'Neurología para Residentes',         categoria: 'Neurología',  nivel: 'Intermedio', esPremium: false, publicado: true,  alumnos: 2310, duracion: '18h', videos: 36, instructor: 'Dra. Sofía Mendoza',  portadaURL: '/assets/images/brain.png'},
  { id: 3,  nombre: 'Pediatría Esencial',                 categoria: 'Pediatría',   nivel: 'Básico',     esPremium: false, publicado: true,  alumnos: 3120, duracion: '15h', videos: 30, instructor: 'Dr. Carlos Ríos',     portadaURL: '/assets/images/baby.png'},
  { id: 4,  nombre: 'Urgencias y Trauma',                 categoria: 'Urgencias',   nivel: 'Avanzado',   esPremium: true,  publicado: true,  alumnos: 2780, duracion: '20h', videos: 40, instructor: 'Dra. Paola Ramos',    portadaURL: '/assets/images/ambulance.png'},
  { id: 5,  nombre: 'Cirugía General — Técnicas Básicas', categoria: 'Cirugía',     nivel: 'Intermedio', esPremium: true,  publicado: false, alumnos: 1560, duracion: '28h', videos: 56, instructor: 'Dr. Roberto Salinas', portadaURL: '/assets/images/surgery-room.png'},
  { id: 9,  nombre: 'ECG e Interpretación Avanzada',      categoria: 'Cardiología', nivel: 'Básico',     esPremium: false, publicado: true,  alumnos: 4200, duracion: '10h', videos: 20, instructor: 'Dr. Alejandro Vega',   portadaURL: '/assets/images/heart-beat.png'},
  { id: 10, nombre: 'Radiología para Clínicos',           categoria: 'Urgencias',   nivel: 'Básico',     esPremium: false, publicado: true,  alumnos: 3560, duracion: '14h', videos: 28, instructor: 'Dra. Camila Vargas',  portadaURL: '/assets/images/hospital.png'},
  { id: 11, nombre: 'Farmacología Clínica Actualizada',   categoria: 'Neurología',  nivel: 'Intermedio', esPremium: true,  publicado: false, alumnos: 2890, duracion: '16h', videos: 32, instructor: 'Dr. Hugo Navarro',    portadaURL: '/assets/images/medicine.png'},
]

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

// ── Fetch functions ────────────────────────────────────────

async function fetchCursos(filters?: Record<string, string>): Promise<Curso[]> {
  await delay(600)
  // TODO: descomentar cuando tengas la API lista
  // const res = await api.get<Curso[]>('/cursos', { params: filters })
  // return res.data
  return MOCK_CURSOS
}

async function fetchCursoById(id: number): Promise<CursoDetalle> {
  await delay(400)
  // TODO: const res = await api.get<CursoDetalle>(`/cursos/${id}`)
  // return res.data
  const curso = MOCK_CURSOS.find(c => c.id === id)
  if (!curso) throw new Error('Curso no encontrado')
  return { ...curso, modulos: [] } as CursoDetalle
}

async function createCurso(data: Omit<Curso, 'id'>): Promise<Curso> {
  const res = await api.post<Curso>('/cursos', data)
  return res.data
}

async function updateCurso(id: number, data: Partial<Curso>): Promise<Curso> {
  const res = await api.put<Curso>(`/cursos/${id}`, data)
  return res.data
}

async function deleteCurso(id: number): Promise<void> {
  await api.delete(`/cursos/${id}`)
}

// ── Hooks de React Query ───────────────────────────────────

/** Lista de cursos con filtros opcionales */
export function useCursos(filters?: Record<string, string>) {
  return useQuery({
    queryKey: cursoKeys.list(filters),
    queryFn:  () => fetchCursos(filters),
  })
}

/** Detalle de un curso por ID */
export function useCurso(id: number) {
  return useQuery({
    queryKey: cursoKeys.detail(id),
    queryFn:  () => fetchCursoById(id),
    enabled:  !!id,
  })
}

/** Crear curso — admin */
export const useCreateCurso = () =>
  useMutation({
    mutationFn: (data: FormData) =>
      api.post('/cursos', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cursos'] }),
  })

/** Editar curso — admin */
export function useUpdateCurso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Curso> }) =>
      updateCurso(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: cursoKeys.detail(id) })
      qc.invalidateQueries({ queryKey: cursoKeys.all() })
    },
  })
}

/** Eliminar curso — admin */
export function useDeleteCurso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteCurso,
    onSuccess: () => qc.invalidateQueries({ queryKey: cursoKeys.all() }),
  })
}

// src/api/cursosApi.ts
export const useCreateVideo = () =>
  useMutation({
    mutationFn: (data: FormData) =>
      api.post('/videos', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
  })