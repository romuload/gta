import { useEffect, type RefObject } from 'react'
import { ScrollTrigger } from '../lib/gsap'
import { clamp } from '../lib/math'

/**
 * Calls `onProgress(p, e)` for a sticky track. One ScrollTrigger per track.
 * - `p`: 0–1 while the track's top is at the viewport top until its bottom
 *   reaches the viewport bottom (the pinned stretch).
 * - `e`: 0–1 while the track is entering, from its top at the viewport
 *   bottom to its top at the viewport top. Lets a section show content
 *   while it rises into view instead of arriving blank.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (p: number, e: number) => void,
  enabled = true,
  opts: { start?: string; end?: string } = {},
) {
  useEffect(() => {
    const el = ref.current
    if (!enabled || !el) return
    const custom = !!(opts.start || opts.end)
    const emit = (q: number) => {
      if (custom) return onProgress(q, 1)
      const r = Math.min(0.99, window.innerHeight / Math.max(1, el.offsetHeight))
      onProgress(clamp((q - r) / (1 - r)), clamp(q / r))
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: opts.start ?? 'top bottom',
      end: opts.end ?? 'bottom bottom',
      onUpdate: (self) => emit(self.progress),
      onRefresh: (self) => emit(self.progress),
    })
    emit(st.progress)
    return () => st.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ref])
}
