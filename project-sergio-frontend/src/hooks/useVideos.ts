// src/hooks/useVideos.ts
// Maneja el estado del reproductor de video y el progreso del curso.

import { useState } from 'react'
import { useVideosByCurso, useMarcarCompletado } from '../api/videosApi'
import type { Video } from '../types'

export function useReproductor(cursoId: number) {
  const { data: videos = [], isLoading, error } = useVideosByCurso(cursoId)
  const { mutate: marcar } = useMarcarCompletado()

  const [videoActivo, setVideoActivo]     = useState<Video | null>(null)
  const [moduloAbierto, setModuloAbierto] = useState<number | null>(1)

  const seleccionarVideo = (video: Video) => {
    setVideoActivo(video)
  }

  const completarVideo = (videoId: number) => {
    marcar(videoId)
  }

  const toggleModulo = (moduloId: number) => {
    setModuloAbierto(prev => prev === moduloId ? null : moduloId)
  }

  const totalVideos      = videos.length
  const videosCompletados = videos.filter(v => v.completado).length
  const progreso         = totalVideos > 0
    ? Math.round((videosCompletados / totalVideos) * 100)
    : 0

  return {
    videos,
    isLoading,
    error,
    videoActivo,
    moduloAbierto,
    seleccionarVideo,
    completarVideo,
    toggleModulo,
    progreso,
    totalVideos,
    videosCompletados,
  }
}