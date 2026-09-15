// src/utils/formatDate.ts

/**
 * Formatea una fecha ISO a formato legible en español.
 * Ej: "2025-03-15T10:00:00Z" → "15 mar 2025"
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'

  return d.toLocaleDateString('es-MX', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
    ...options,
  })
}

/**
 * Fecha + hora
 * Ej: "15 mar 2025, 10:30"
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

/**
 * Tiempo relativo desde ahora.
 * Ej: "Hace 3 días", "Hace 2 horas", "Hace 5 minutos"
 */
export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'

  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)

  const intervals: [number, string][] = [
    [31536000, 'año'],
    [2592000,  'mes'],
    [604800,   'semana'],
    [86400,    'día'],
    [3600,     'hora'],
    [60,       'minuto'],
  ]

  for (const [secs, unit] of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) {
      const plural =
        unit === 'mes'    ? (count > 1 ? 'meses'    : 'mes')    :
        unit === 'año'    ? (count > 1 ? 'años'     : 'año')    :
        count > 1         ? `${unit}s`                           : unit
      return `Hace ${count} ${plural}`
    }
  }

  return 'Hace un momento'
}

/**
 * Duración en segundos → formato mm:ss o hh:mm:ss
 * Ej: 3725 → "1:02:05"
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}