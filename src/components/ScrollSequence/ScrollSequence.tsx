import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { FrameSequence } from '../../lib/frameSequence'
import { useIsMobile } from '../../hooks/useMediaQuery'
import './ScrollSequence.css'

export interface ScrollSequenceHandle {
  /** Target frame (fractional source index). The canvas eases toward it. */
  setFrame: (f: number) => void
}

interface Props {
  seq: FrameSequence | null
  poster: string
  label: string
  /** Horizontal focus for the cover crop, 0–1 (keeps the character in frame). */
  focusX?: number
  lerp?: number
  className?: string
}

/**
 * Full-bleed canvas that draws the nearest pre-decoded frame. Only redraws
 * when the frame index or the canvas size changes; the loop sleeps while the
 * hero is off screen.
 */
export const ScrollSequence = forwardRef<ScrollSequenceHandle, Props>(function ScrollSequence(
  { seq, poster, label, focusX = 0.6, lerp = 0.25, className = '' },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const target = useRef(0)
  const current = useRef(0)
  const drawn = useRef({ index: -1, w: 0, h: 0 })
  const isMobile = useIsMobile()
  const fx = isMobile ? Math.min(1, focusX + 0.04) : focusX

  useImperativeHandle(ref, () => ({ setFrame: (f) => (target.current = f) }), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !seq) return
    const ctx = canvas.getContext('2d', { alpha: true })!
    let raf = 0
    let visible = true
    let dirty = true

    const resize = () => {
      // The source is 992px wide: more than ~1.5× DPR adds cost, not detail.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = Math.round(canvas.clientWidth * dpr)
      const h = Math.round(canvas.clientHeight * dpr)
      if (w !== canvas.width || h !== canvas.height) {
        canvas.width = w
        canvas.height = h
        dirty = true
      }
    }

    const draw = () => {
      const hit = seq.nearest(current.current)
      if (!hit) return
      const { width: cw, height: ch } = canvas
      if (!dirty && hit.index === drawn.current.index) return
      const iw = hit.frame.width
      const ih = hit.frame.height
      const s = Math.max(cw / iw, ch / ih)
      const dw = iw * s
      const dh = ih * s
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(hit.frame, (cw - dw) * fx, (ch - dh) / 2, dw, dh)
      drawn.current = { index: hit.index, w: cw, h: ch }
      dirty = false
      canvas.dataset.frame = String(hit.index)
    }

    const tick = () => {
      raf = 0
      const diff = target.current - current.current
      current.current = Math.abs(diff) < 0.01 ? target.current : current.current + diff * lerp
      draw()
      if (visible) raf = requestAnimationFrame(tick)
    }

    const ro = new ResizeObserver(() => {
      resize()
      draw()
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(tick)
    })
    io.observe(canvas)
    // A newly arrived frame may be closer to the target than the one shown.
    const off = seq.onFrame(() => (dirty = true))
    resize()
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      off()
    }
  }, [seq, fx, lerp])

  return (
    <div className={`scroll-sequence ${className}`} style={{ backgroundImage: `url(${poster})`, backgroundPosition: `${fx * 100}% 50%` }}>
      <canvas ref={canvasRef} role="img" aria-label={label} />
    </div>
  )
})
