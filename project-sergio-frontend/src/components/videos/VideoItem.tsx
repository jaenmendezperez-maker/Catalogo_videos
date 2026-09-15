// src/components/videos/VideoItem.tsx
import Badge from '../ui/Badge'

export interface VideoItem { id: number; titulo: string; duracion: string; esPremium: boolean; completado: boolean }

interface Props {
  video:      VideoItem
  index:      number
  estaActivo: boolean
  puede:      boolean
  onClick:    (video: VideoItem) => void
}

function VideoItem({ video, index, estaActivo, puede, onClick }: Props) {
  return (
    <button
      onClick={() => onClick(video)}
      className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all border-b border-[#c6c6cd] last:border-0 cursor-pointer ${
        estaActivo ? 'bg-[#cce5ff]/50' : puede ? 'hover:bg-[#dce9ff]/50' : 'opacity-70 hover:opacity-90 hover:bg-[#fff3d6]'
      }`}
    >
      <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-[#dce9ff]">
        {video.completado ? (
          <svg className="w-4 h-4 text-[#069669]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : !puede ? (
          <svg className="w-4 h-4 text-[#c9922f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ) : estaActivo ? (
          <svg className="w-4 h-4 text-[#006398]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        ) : (
          <span className="text-[#45464d] text-xs font-medium">{index + 1}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${estaActivo ? 'text-[#006398] font-medium' : 'text-[#0b1c30]'}`}>{video.titulo}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {video.esPremium && <Badge variant="premium">Premium</Badge>}
        <span className="text-[#45464d] text-xs">{video.duracion}</span>
      </div>
    </button>
  )
}

export default VideoItem