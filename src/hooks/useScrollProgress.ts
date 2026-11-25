import { useEffect, type RefObject } from 'react'
import { ScrollTrigger } from '../lib/gsap'
import { clamp } from '../lib/math'

/**
 * Calls `onProgress(p, e)` for a sticky track. One ScrollTrigger per track
 * drives updates; the values themselves come from live layout geometry.
 *
 * - `p`: 0–1 across the pinned stretch. Measured against the sticky child's
 *   real height, so it is exactly 0 at the top of the page on every browser,
 *   including iOS Safari, where `innerHeight` and `100svh` disagree while the
 *   toolbars float.
 * - `e`: 0–1 while the track rises into view (top at viewport bottom → top).
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

    const emitGeometry = () => {
      const rect = el.getBoundingClientRect()
      const sticky = el.firstElementChild as HTMLElement | null
      const pinned = Math.max(1, el.offsetHeight - (sticky?.offsetHeight ?? window.innerHeight))
      const vh = document.documentElement.clientHeight || window.innerHeight
      onProgress(clamp(-rect.top / pinned), clamp((vh - rect.top) / vh))
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: opts.start ?? 'top bottom',
      end: opts.end ?? 'bottom top',
      onUpdate: (self) => (custom ? onProgress(self.progress, 1) : emitGeometry()),
      onRefresh: (self) => (custom ? onProgress(self.progress, 1) : emitGeometry()),
    })
    if (custom) onProgress(st.progress, 1)
    else emitGeometry()
    return () => st.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ref])
}
