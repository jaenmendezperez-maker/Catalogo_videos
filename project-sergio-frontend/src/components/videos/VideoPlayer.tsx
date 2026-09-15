// src/components/videos/VideoPlayer.tsx
interface VideoItem { id: number; titulo: string; duracion: string; esPremium: boolean; completado: boolean }

interface Props {
  video:       VideoItem | null
  color?:      string
  thumbnailURL?: string
}

function VideoPlayer({ video, color, thumbnailURL }: Props) {

  // ── ESTADO 1: Ningún video seleccionado ──
  if (!video) return (
    <div className="aspect-video rounded border border-[#c6c6cd] flex flex-col items-center justify-center relative overflow-hidden bg-[#e5eeff]">

      {color && (
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-40`} />
      )}

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex items-center justify-center backdrop-blur-sm">
          <img src="/assets/images/footage.png" className="w-20 h-20 object-contain opacity-80 drop-shadow-md" alt="" />
        </div>
        <div className="text-center">
          <p className="text-[#45464d] text-sm font-medium">Selecciona una clase para comenzar</p>
          <p className="text-[#76777d] text-xs mt-1">Elige un video del temario</p>
        </div>
      </div>
    </div>
  )

  // ── ESTADO 2: Video cargado y listo para reproducir ──
  return (
    <div className="overflow-hidden bg-[#0b1c30] border border-[#c6c6cd] rounded shadow-2xl">

      {/* Área del video — se mantiene oscura a propósito: es el fondo del reproductor mismo */}
      <div className="aspect-video relative group cursor-pointer overflow-hidden bg-black">

        <div className="absolute inset-0 bg-black/40" />

        {/* Título flotante */}
        <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-5 translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white text-sm font-medium drop-shadow-md">{video.titulo}</p>
        </div>

        {/* Botón PLAY */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/assets/images/play.png"
            alt="play"
            className="w-18 h-18 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Duración esquina inferior */}
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded">
          {video.duracion}
        </div>
      </div>

      {/* Barra de controles inferior — parte del "chasis" del reproductor, se queda oscura */}
      <div className="bg-[#0b1c30] px-4 py-3 flex items-center gap-4 border-t border-white/10">
        <button className="text-white hover:text-[#5bb8fe] transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </button>

        <div className="flex-1 flex items-center gap-3 group/progress cursor-pointer">
          <span className="text-[#5bb8fe] text-xs font-mono w-8">0:00</span>
          <div className="flex-1 bg-white/15 h-1.5 rounded relative">
            <div className="bg-[#5bb8fe] h-1.5 w-[2%] rounded relative group-hover/progress:bg-[#93ccff] transition-colors">
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-white/60 text-xs font-mono w-8">{video.duracion}</span>
        </div>

        <div className="flex items-center gap-3 text-white/60">
          <button className="hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
            </svg>
          </button>
          <button className="hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer