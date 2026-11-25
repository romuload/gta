import { useEffect, useRef, type RefObject } from 'react'

/**
 * Drives `video.currentTime` toward a target time with eased chasing.
 * The video never plays on its own. Seeks are throttled: a new seek is only
 * issued once the previous one has completed, which keeps decoding smooth.
 */
export function useVideoScrubbing(
  videoRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean,
  lerpFactor = 0.2,
) {
  const target = useRef(0)
  const current = useRef(0)

  useEffect(() => {
    const video = videoRef.current
    if (!enabled || !video) return
    let raf = 0
    let seeking = false
    const onSeeked = () => (seeking = false)
    video.addEventListener('seeked', onSeeked)
    video.pause()

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const diff = target.current - current.current
      if (Math.abs(diff) < 0.0005) current.current = target.current
      else current.current += diff * lerpFactor
      const duration = video.duration || 0
      if (!duration || seeking) return
      const t = Math.min(duration - 0.04, Math.max(0, current.current))
      if (Math.abs(video.currentTime - t) > 1 / 60) {
        seeking = true
        video.currentTime = t
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      video.removeEventListener('seeked', onSeeked)
    }
  }, [enabled, lerpFactor, videoRef])

  return {
    setTime: (t: number) => {
      target.current = t
    },
  }
}
