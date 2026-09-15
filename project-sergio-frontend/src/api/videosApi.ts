// src/api/videosApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'
import type { Video } from '../types'

// ── Query Keys ─────────────────────────────────────────────

export const videoKeys = {
  all:         ()           => ['videos']                       as const,
  byCurso:     (cursoId: number) => ['videos', 'curso', cursoId] as const,
  detail:      (id: number) => ['videos', 'detail', id]         as const,
}

// ── Mock data ──────────────────────────────────────────────

const MOCK_VIDEOS: Video[] = [
  { id: 1,  titulo: 'Anatomía cardíaca funcional',           duracion: '18:42', esPremium: false, oculto: false, ordenEnSecuencia: 1,  cursoId: 1, linkEnlace: '', completado: true  },
  { id: 2,  titulo: 'Fisiología del ciclo cardíaco',         duracion: '22:15', esPremium: false, oculto: false, ordenEnSecuencia: 2,  cursoId: 1, linkEnlace: '', completado: true  },
  { id: 3,  titulo: 'Semiología cardiovascular',             duracion: '31:08', esPremium: true,  oculto: false, ordenEnSecuencia: 3,  cursoId: 1, linkEnlace: '', completado: false },
  { id: 4,  titulo: 'Lectura sistemática del ECG',           duracion: '25:30', esPremium: false, oculto: false, ordenEnSecuencia: 4,  cursoId: 1, linkEnlace: '', completado: false },
  { id: 5,  titulo: 'Arritmias supraventriculares',          duracion: '28:44', esPremium: true,  oculto: false, ordenEnSecuencia: 5,  cursoId: 1, linkEnlace: '', completado: false },
  { id: 6,  titulo: 'Arritmias ventriculares',               duracion: '24:12', esPremium: true,  oculto: false, ordenEnSecuencia: 6,  cursoId: 1, linkEnlace: '', completado: false },
  { id: 7,  titulo: 'Evaluación del nivel de conciencia',    duracion: '20:10', esPremium: false, oculto: false, ordenEnSecuencia: 1,  cursoId: 2, linkEnlace: '', completado: false },
  { id: 8,  titulo: 'Pares craneales — exploración práctica',duracion: '24:35', esPremium: false, oculto: false, ordenEnSecuencia: 2,  cursoId: 2, linkEnlace: '', completado: false },
  { id: 9,  titulo: 'ACV isquémico — código ictus',          duracion: '32:20', esPremium: false, oculto: false, ordenEnSecuencia: 3,  cursoId: 2, linkEnlace: '', completado: false },
]

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

// ── Fetch functions ────────────────────────────────────────

async function fetchVideosByCurso(cursoId: number): Promise<Video[]> {
  await delay(400)
  // TODO: const res = await api.get<Video[]>(`/cursos/${cursoId}/videos`)
  // return res.data
  return MOCK_VIDEOS.filter(v => v.cursoId === cursoId)
}

async function fetchVideoById(id: number): Promise<Video> {
  await delay(300)
  // TODO: const res = await api.get<Video>(`/videos/${id}`)
  // return res.data
  const video = MOCK_VIDEOS.find(v => v.id === id)
  if (!video) throw new Error('Video no encontrado')
  return video
}

async function createVideo(data: Omit<Video, 'id'>): Promise<Video> {
  const res = await api.post<Video>('/videos', data)
  return res.data
}

async function updateVideo(id: number, data: Partial<Video>): Promise<Video> {
  const res = await api.put<Video>(`/videos/${id}`, data)
  return res.data
}

async function deleteVideo(id: number): Promise<void> {
  await api.delete(`/videos/${id}`)
}

async function marcarCompletado(id: number): Promise<void> {
  // TODO: await api.post(`/videos/${id}/completado`)
  await delay(200)
}

// ── Hooks ──────────────────────────────────────────────────

/** Videos de un curso específico */
export function useVideosByCurso(cursoId: number) {
  return useQuery({
    queryKey: videoKeys.byCurso(cursoId),
    queryFn:  () => fetchVideosByCurso(cursoId),
    enabled:  !!cursoId,
  })
}

/** Detalle de un video */
export function useVideo(id: number) {
  return useQuery({
    queryKey: videoKeys.detail(id),
    queryFn:  () => fetchVideoById(id),
    enabled:  !!id,
  })
}

/** Crear video — admin */
export function useCreateVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createVideo,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: videoKeys.byCurso(variables.cursoId) })
    },
  })
}

/** Editar video — admin */
export function useUpdateVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Video> }) =>
      updateVideo(id, data),
    onSuccess: (updatedVideo) => {
      qc.invalidateQueries({ queryKey: videoKeys.detail(updatedVideo.id) })
      qc.invalidateQueries({ queryKey: videoKeys.byCurso(updatedVideo.cursoId) })
    },
  })
}

/** Eliminar video — admin */
export function useDeleteVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, cursoId }: { id: number; cursoId: number }) =>
      deleteVideo(id),
    onSuccess: (_, { cursoId }) => {
      qc.invalidateQueries({ queryKey: videoKeys.byCurso(cursoId) })
    },
  })
}

/** Marcar video como completado — usuario */
export function useMarcarCompletado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: marcarCompletado,
    onSuccess: () => {
      // Invalida todos los videos para que se actualice el progreso
      qc.invalidateQueries({ queryKey: videoKeys.all() })
    },
  })
}