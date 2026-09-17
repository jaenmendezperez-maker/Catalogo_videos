// src/components/videos/VideoPlayer.tsx
import type { VideoReproduccionDto } from '../../types'

interface VideoItem { id: number; titulo: string; duracion: string; esPremium: boolean }

interface Props {
  video: VideoItem | null
  color?: string
  reproduccion?: VideoReproduccionDto
  isLoading?: boolean
  errorCode?: 401 | 403 | 404 | 500
  onPlayClick?: () => void
}

function VideoPlayer({ video, color, reproduccion, isLoading, errorCode, onPlayClick }: Props) {
  // ── ESTADO 1: Ningún video seleccionado ──
  if (!video) return (
    <div className="aspect-video rounded border border-[#c6c6cd] flex flex-col items-center justify-center relative overflow-hidden bg-[#e5eeff]">
      {color && <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-40`} />}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <img src="/assets/images/footage.png" className="w-20 h-20 object-contain opacity-80 drop-shadow-md" alt="" />
        <div className="text-center">
          <p className="text-[#45464d] text-sm font-medium">Selecciona una clase para comenzar</p>
          <p className="text-[#76777d] text-xs mt-1">Elige un video del temario</p>
        </div>
      </div>
    </div>
  )

  // ── ESTADO 2: Sin permiso (403) ──
  if (errorCode === 403) return (
    <div className="aspect-video rounded border border-[#c6c6cd] flex flex-col items-center justify-center bg-[#fff3d6]">
      <p className="text-[#0b1c30] text-sm font-medium mb-2">Este video es Premium</p>
      <p className="text-[#76777d] text-xs">Necesitas una suscripción activa para verlo</p>
    </div>
  )

  // ── ESTADO 3: Cargando la URL firmada ──
  if (isLoading || !reproduccion) return (
    <div className="aspect-video rounded border border-[#c6c6cd] bg-[#0b1c30] flex items-center justify-center cursor-pointer" onClick={onPlayClick}>
      {isLoading ? (
        <span className="text-white/60 text-sm">Cargando video…</span>
      ) : (
        <img src="/assets/images/play.png" alt="play" className="w-18 h-18 object-contain" />
      )}
    </div>
  )

  // ── ESTADO 4: Video listo — iframe real de Bunny ──
  return (
    <div className="overflow-hidden bg-[#0b1c30] border border-[#c6c6cd] rounded shadow-2xl">
      <div className="aspect-video relative bg-black">
        <iframe
          src={reproduccion.url}
          loading="lazy"
          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
          title={reproduccion.titulo}
        />
      </div>
    </div>
  )
}

export default VideoPlayer