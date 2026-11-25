import { useRef } from 'react'
import { content, SECTION_IDS } from '../../config/content'
import { motion } from '../../config/motion'
import { range, easeOut } from '../../lib/math'
import { productStore } from '../../lib/productStore'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { useModelDrag } from '../../hooks/useModelDrag'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { SplitHeadline } from '../SplitHeadline/SplitHeadline'
import './ProductExperience.css'

const M = motion.product

/** In/out envelope for a text window: fade + small rise in, fade + rise out. */
function envelope(p: number, [a, b]: readonly [number, number], fade: number) {
  const len = (b - a) * fade
  const inT = easeOut(range(p, [a, a + len]))
  const outT = range(p, [b - len, b])
  return { opacity: inT * (1 - outT), y: (1 - inT) * 24 - outT * 24 }
}

function apply(el: HTMLElement | null, { opacity, y }: { opacity: number; y: number }) {
  if (!el) return
  el.style.opacity = opacity.toFixed(3)
  el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`
  el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible'
}

interface Props {
  reducedMotion: boolean
}

export function ProductExperience({ reducedMotion }: Props) {
  const c = content.experience
  const isMobile = useIsMobile()
  const trackRef = useRef<HTMLElement>(null)
  const introRef = useRef<HTMLElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)
  const blockRefs = useRef<(HTMLElement | null)[]>([])

  useModelDrag(dragRef, !reducedMotion)

  useScrollProgress(
    trackRef,
    (p, entry) => {
      productStore.p = p
      const inT = easeOut(range(entry, M.intro.in as [number, number]))
      const outT = range(p, M.intro.out as [number, number])
      apply(introRef.current, { opacity: inT * (1 - outT), y: (1 - inT) * 40 - outT * 40 })
      M.blocks.forEach((w, i) => apply(blockRefs.current[i], envelope(p, w as [number, number], M.blockFade)))
      apply(hintRef.current, envelope(p, [0.16, 0.88], 0.06))
      if (dragRef.current) dragRef.current.style.pointerEvents = p > 0.12 && p < 0.97 ? 'auto' : 'none'
    },
    !reducedMotion,
  )

  return (
    <section
      id={SECTION_IDS.experience}
      ref={trackRef}
      className={`experience${reducedMotion ? ' experience--static' : ''}`}
      style={{ ['--track' as string]: `${isMobile ? M.scrollLengthMobile : M.scrollLength}svh` }}
      aria-labelledby="experience-title"
    >
      <div className="experience__sticky">
        <header className="experience__intro" ref={introRef}>
          <p className="eyebrow eyebrow--accent">{c.eyebrow}</p>
          <SplitHeadline lines={c.headline} id="experience-title" className="display experience__headline" />
          <p className="lead">{c.description}</p>
        </header>

        {!reducedMotion && (
          <div
            ref={dragRef}
            className="experience__drag"
            tabIndex={0}
            role="img"
            aria-label={c.modelLabel}
          />
        )}

        <div className="experience__blocks container">
          {c.blocks.map((b, i) => (
            <article
              key={b.eyebrow}
              ref={(el) => {
                blockRefs.current[i] = el
              }}
              className={`experience__block experience__block--${b.side}`}
            >
              <p className="eyebrow eyebrow--accent">{b.eyebrow}</p>
              <SplitHeadline lines={b.headline} as="h3" className="display display--m" />
              <p className="body">{b.description}</p>
            </article>
          ))}
        </div>

        {!reducedMotion && (
          <p className="experience__hint eyebrow" ref={hintRef} aria-hidden="true">
            <span className="experience__hint-icon" />
            {c.drag}
          </p>
        )}
      </div>
    </section>
  )
}
