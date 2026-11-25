import { useEffect, type RefObject } from 'react'
import { ScrollTrigger } from '../lib/gsap'

/**
 * Calls `onProgress` with 0–1 while `ref` scrolls from its top hitting the
 * viewport top to its bottom hitting the viewport bottom (a sticky track).
 * One ScrollTrigger per track, no raw scroll listeners.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void,
  enabled = true,
  opts: { start?: string; end?: string } = {},
) {
  useEffect(() => {
    if (!enabled || !ref.current) return
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start: opts.start ?? 'top top',
      end: opts.end ?? 'bottom bottom',
      onUpdate: (self) => onProgress(self.progress),
      onRefresh: (self) => onProgress(self.progress),
    })
    onProgress(st.progress)
    return () => st.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ref])
}
