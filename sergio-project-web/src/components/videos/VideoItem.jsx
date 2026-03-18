// src/components/videos/VideoPlayer.jsx
// Reproductor de video. Cuando tengas URLs reales, reemplaza el div por <video src={video.url} controls />
// Uso: <VideoPlayer video={videoObj} />

function VideoPlayer({ video }) {
  if (!video) {
    return (
      <div className="aspect-video bg-[#0D1B2E] rounded-2xl flex flex-col items-center justify-center border border-white/5">
        <div className="text-5xl mb-3">▶️</div>
        <p className="text-slate-400 text-sm">Selecciona un video para comenzar</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-black border border-white/5">
      {/* Simulación — reemplaza este div con: <video src={video.url} controls className="w-full aspect-video" /> */}
      <div className="aspect-video bg-gradient-to-br from-slate-900 to-[#0D1B2E] flex items-center justify-center relative group cursor-pointer">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform">
          <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <p className="absolute bottom-4 left-4 text-white text-sm font-medium">{video.titulo}</p>
        <span className="absolute bottom-4 right-4 text-slate-400 text-xs">{video.duracion}</span>
      </div>

      {/* Controles */}
      <div className="bg-[#0D1B2E] px-4 py-3 flex items-center gap-3">
        <button className="text-white hover:text-cyan-400 transition-colors">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </button>
        <div className="flex-1 bg-slate-700 rounded-full h-1.5 cursor-pointer">
          <div className="bg-cyan-500 h-1.5 rounded-full w-0" />
        </div>
        <span className="text-slate-400 text-xs font-mono">0:00 / {video.duracion}</span>
      </div>
    </div>
  );
}

export default VideoPlayer;