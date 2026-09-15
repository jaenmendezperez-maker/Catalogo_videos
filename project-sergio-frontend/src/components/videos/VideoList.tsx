// src/components/videos/VideoList.tsx
import VideoItemComponent, { type VideoItem } from './VideoItem'

interface Props {
  videos:        VideoItem[]
  videoActivo:   VideoItem | null
  puedeVerVideo: (video: VideoItem) => boolean
  onVideoClick:  (video: VideoItem) => void
}

function VideoList({ videos, videoActivo, puedeVerVideo, onVideoClick }: Props) {
  return (
    <div>
      {videos.map((video, idx) => (
        <VideoItemComponent
          key={video.id}
          video={video}
          index={idx}
          estaActivo={videoActivo?.id === video.id}
          puede={puedeVerVideo(video)}
          onClick={onVideoClick}
        />
      ))}
    </div>
  )
}

export default VideoList