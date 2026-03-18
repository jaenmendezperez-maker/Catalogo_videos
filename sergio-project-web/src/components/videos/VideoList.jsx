// src/components/videos/VideoList.jsx
// Lista de videos de un módulo.
// Uso: <VideoList videos={array} videoActivo={v} onVideoClick={fn} puedeVerPremium={bool} />

import VideoItem from './VideoItem';

function VideoList({ videos = [], videoActivo, onVideoClick, puedeVerPremium = false }) {
  if (videos.length === 0) {
    return <p className="text-slate-500 text-sm px-5 py-4">No hay videos en este módulo.</p>;
  }

  return (
    <div>
      {videos.map((video, idx) => {
        const puedeVer = !video.esPremium || puedeVerPremium;
        return (
          <VideoItem
            key={video.id}
            video={video}
            index={idx}
            activo={videoActivo?.id === video.id}
            onClick={onVideoClick}
            puedeVer={puedeVer}
          />
        );
      })}
    </div>
  );
}

export default VideoList;