// src/hooks/useCursos.ts
// Wrapper sobre useCursos de cursosApi con lógica de filtrado local.
// Filtros reducidos a lo que el backend realmente expone (ver types/index.ts):
// categoria, instructor, nivel, alumnos y duracion no existen en CursoVistasPreviaDto.

import { useState, useMemo } from 'react'
import { useCursos as useCursosQuery } from '../api/cursosApi'

interface FiltrosCursos {
  busqueda: string
  premium: 'todos' | 'solo-premium' | 'solo-gratis'
  orden: 'nombre' | 'videos'
}

const FILTROS_INICIALES: FiltrosCursos = {
  busqueda: '',
  premium: 'todos',
  orden: 'nombre',
}

export function useCursosFiltrados() {
  const { data, isLoading, error } = useCursosQuery()
  const cursos = data?.datos ?? [] // useCursosQuery ahora devuelve PaginatedResponse, no un array directo

  const [filtros, setFiltros] = useState<FiltrosCursos>(FILTROS_INICIALES)

  const cursosFiltrados = useMemo(() => {
    let resultado = [...cursos]

    if (filtros.busqueda.trim()) {
      const q = filtros.busqueda.toLowerCase()
      resultado = resultado.filter((c) => c.nombre?.toLowerCase().includes(q))
    }

    if (filtros.premium === 'solo-premium')
      resultado = resultado.filter((c) => c.esPremium)
    if (filtros.premium === 'solo-gratis')
      resultado = resultado.filter((c) => !c.esPremium)

    if (filtros.orden === 'nombre')
      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre))
    if (filtros.orden === 'videos')
      resultado.sort((a, b) => b.cantidadVideos - a.cantidadVideos)

    return resultado
  }, [cursos, filtros])

  const hayFiltrosActivos =
    filtros.busqueda !== '' ||
    filtros.premium !== 'todos'

  const resetFiltros = () => setFiltros(FILTROS_INICIALES)

  const setFiltro = <K extends keyof FiltrosCursos>(key: K, value: FiltrosCursos[K]) => {
    setFiltros((prev) => ({ ...prev, [key]: value }))
  }

  return {
    cursos: cursosFiltrados,
    isLoading,
    error,
    filtros,
    setFiltro,
    resetFiltros,
    hayFiltrosActivos,
    total: cursosFiltrados.length,
  }
}