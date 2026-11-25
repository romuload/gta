import { useEffect, useState } from 'react'

/**
 * Downloads the hero video as a Blob with real byte progress.
 * A Blob URL is fully seekable in memory, which is what frame-accurate
 * scroll scrubbing needs. Falls back to the plain URL if fetch fails.
 */
export function useHeroAssets(videoUrl: string, enabled: boolean) {
  const [progress, setProgress] = useState<number | null>(enabled ? 0 : 1)
  const [src, setSrc] = useState<string | null>(enabled ? null : videoUrl)

  useEffect(() => {
    if (!enabled) return
    const ctrl = new AbortController()
    let objectUrl: string | null = null
    ;(async () => {
      try {
        const res = await fetch(videoUrl, { signal: ctrl.signal })
        const total = Number(res.headers.get('content-length')) || 0
        if (!res.body || !total) {
          setProgress(null)
          const blob = await res.blob()
          objectUrl = URL.createObjectURL(blob)
        } else {
          const reader = res.body.getReader()
          const chunks: BlobPart[] = []
          let loaded = 0
          for (;;) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
            loaded += value.length
            setProgress(loaded / total)
          }
          objectUrl = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }))
        }
        await document.fonts.ready
        setProgress(1)
        setSrc(objectUrl)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setProgress(1)
        setSrc(videoUrl)
      }
    })()
    return () => {
      ctrl.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [enabled, videoUrl])

  return { progress, src, ready: src !== null }
}
