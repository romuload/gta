import { useEffect, type RefObject } from 'react'
import { productStore } from '../lib/productStore'
import { motion } from '../config/motion'
import { clamp } from '../lib/math'

/**
 * Click/touch-drag rotation on a DOM surface over the model.
 * `touch-action: pan-y` on the surface keeps vertical page scroll native on
 * touch screens: only horizontal swipes rotate there. Wheel is never captured.
 * Arrow keys rotate too, for keyboard users.
 */
export function useModelDrag(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    const { sensitivity, maxTiltX } = motion.product.drag
    const d = productStore.drag
    let lastX = 0
    let lastY = 0
    let id: number | null = null

    const down = (e: PointerEvent) => {
      if (e.button !== 0) return
      id = e.pointerId
      lastX = e.clientX
      lastY = e.clientY
      d.active = true
      el.setPointerCapture(id)
      el.classList.add('is-dragging')
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      d.y += dx * sensitivity
      // Vertical tilt only with a mouse/pen; on touch vertical motion is page scroll.
      if (e.pointerType !== 'touch') d.x = clamp(d.x + dy * sensitivity, -maxTiltX, maxTiltX)
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      id = null
      d.active = false
      el.classList.remove('is-dragging')
    }
    const key = (e: KeyboardEvent) => {
      const step = 0.25
      if (e.key === 'ArrowLeft') d.y -= step
      else if (e.key === 'ArrowRight') d.y += step
      else if (e.key === 'ArrowUp') d.x = clamp(d.x - step, -maxTiltX, maxTiltX)
      else if (e.key === 'ArrowDown') d.x = clamp(d.x + step, -maxTiltX, maxTiltX)
      else return
      e.preventDefault()
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('lostpointercapture', up)
    el.addEventListener('keydown', key)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('lostpointercapture', up)
      el.removeEventListener('keydown', key)
      d.active = false
    }
  }, [ref, enabled])
}
