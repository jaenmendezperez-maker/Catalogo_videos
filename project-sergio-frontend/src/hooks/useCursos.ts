// src/hooks/useCursos.ts
// Wrapper sobre useCursos de cursosApi con lógica de filtrado local.
// Útil para el catálogo donde los filtros son del lado del cliente.

import { useState, useMemo } from 'react'
import { useCursos as useCursosQuery } from '../api/cursosApi'
import type { Curso, NivelCurso, CategoriaCurso } from '../types'

interface FiltrosCursos {
  busqueda:  string
  categoria: CategoriaCurso | 'Todas'
  nivel:     NivelCurso     | 'Todos'
  premium:   'todos' | 'solo-premium' | 'solo-gratis'
  orden:     'popular' | 'reciente' | 'duracion'
}

const FILTROS_INICIALES: FiltrosCursos = {
  busqueda:  '',
  categoria: 'Todas',
  nivel:     'Todos',
  premium:   'todos',
  orden:     'popular',
}

export function useCursosFiltrados() {
  const { data: cursos = [], isLoading, error } = useCursosQuery()
  const [filtros, setFiltros] = useState<FiltrosCursos>(FILTROS_INICIALES)

  const cursosFiltrados = useMemo(() => {
    let resultado = [...cursos]

    if (filtros.busqueda.trim()) {
      const q = filtros.busqueda.toLowerCase()
      resultado = resultado.filter(c =>
        c.nombre?.toLowerCase().includes(q)      ||
        c.categoria?.toLowerCase().includes(q)   ||
        c.instructor?.toLowerCase().includes(q)
      )
    }

    if (filtros.categoria !== 'Todas')
      resultado = resultado.filter(c => c.categoria === filtros.categoria)

    if (filtros.nivel !== 'Todos')
      resultado = resultado.filter(c => c.nivel === filtros.nivel)

    if (filtros.premium === 'solo-premium')
      resultado = resultado.filter(c => c.esPremium)
    if (filtros.premium === 'solo-gratis')
      resultado = resultado.filter(c => !c.esPremium)

    if (filtros.orden === 'popular')
      resultado.sort((a, b) => (b.alumnos ?? 0) - (a.alumnos ?? 0))
    if (filtros.orden === 'duracion')
      resultado.sort((a, b) => parseInt(a.duracion ?? '0') - parseInt(b.duracion ?? '0'))

    return resultado
  }, [cursos, filtros])

  const hayFiltrosActivos =
    filtros.busqueda !== ''       ||
    filtros.categoria !== 'Todas' ||
    filtros.nivel !== 'Todos'     ||
    filtros.premium !== 'todos'

  const resetFiltros = () => setFiltros(FILTROS_INICIALES)

  const setFiltro = <K extends keyof FiltrosCursos>(key: K, value: FiltrosCursos[K]) => {
    setFiltros(prev => ({ ...prev, [key]: value }))
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