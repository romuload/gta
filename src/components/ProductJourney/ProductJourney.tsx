import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { productStore } from '../../lib/productStore'
import './ProductJourney.css'

const ProductStage = lazy(() => import('../ProductModel/ProductStage'))

interface Props {
  reducedMotion: boolean
  children: ReactNode
}

/**
 * Wraps Sections 03 and 04 and owns the single fixed WebGL canvas that the
 * case lives in for both. The stage (three.js, GLB, shader compilation) is
 * prepared from the start, while the loading screen covers the page, so none
 * of that one-off work lands in a scroll frame later. It only renders while
 * the journey is on screen.
 */
export function ProductJourney({ reducedMotion, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  productStore.reduced = reducedMotion

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onScreen = new IntersectionObserver(([e]) => setActive(e.isIntersecting))
    onScreen.observe(el)
    return () => onScreen.disconnect()
  }, [])

  return (
    <div ref={ref} className="journey">
      <div className={`product-stage${active ? ' is-active' : ''}`} aria-hidden="true">
        <Suspense fallback={null}>
          <ProductStage active={active} />
        </Suspense>
      </div>
      {children}
    </div>
  )
}
