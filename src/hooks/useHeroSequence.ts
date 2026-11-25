import { useEffect, useState } from 'react'
import { FrameSequence } from '../lib/frameSequence'
import { motion } from '../config/motion'
import { asset } from '../config/content'

const url = (i: number) => asset(`assets/sequence/f${String(i).padStart(3, '0')}.webp`)

/**
 * Starts loading the hero frames. Phones and slow connections load every
 * other frame (half the bytes; at 12 fps of source the scrub still reads as
 * continuous motion). The loader waits only for the coarse pass.
 */
export function useHeroSequence(enabled: boolean) {
  const [state, setState] = useState<{ seq: FrameSequence | null; progress: number; ready: boolean }>({
    seq: null,
    progress: enabled ? 0 : 1,
    ready: !enabled,
  })

  useEffect(() => {
    if (!enabled) return
    const m = motion.hero.sequence
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    const light =
      window.matchMedia('(max-width: 1023px), (pointer: coarse)').matches ||
      !!conn?.saveData ||
      /(^|-)2g|3g/.test(conn?.effectiveType ?? '')
    const seq = new FrameSequence(m.frames, url, light ? 2 : 1)
    setState({ seq, progress: 0, ready: false })
    let alive = true
    seq
      .load(m.coarseEvery, (progress) => alive && setState((s) => ({ ...s, progress })))
      .then(() => alive && setState((s) => ({ ...s, progress: 1, ready: true })))
    return () => {
      alive = false
      seq.dispose()
    }
  }, [enabled])

  return state
}
