import { forwardRef } from 'react'
import './ScrollVideo.css'

interface Props {
  src: string | null
  poster: string
  label: string
  className?: string
}

/** Full-bleed, muted, never-autoplaying video used as a scrub surface. */
export const ScrollVideo = forwardRef<HTMLVideoElement, Props>(function ScrollVideo(
  { src, poster, label, className = '' },
  ref,
) {
  return (
    <video
      ref={ref}
      className={`scroll-video ${className}`}
      src={src ?? undefined}
      poster={poster}
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      aria-label={label}
      tabIndex={-1}
    />
  )
})
