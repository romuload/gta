import { useRef } from 'react'
import { content, ASSETS, SECTION_IDS } from '../../config/content'
import { motion } from '../../config/motion'
import { range, lerp, easeOut, easeIn, easeInOut } from '../../lib/math'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { SplitHeadline } from '../SplitHeadline/SplitHeadline'
import { StickyCard } from '../StickyCard/StickyCard'
import './BenefitsSection.css'

const W = motion.world

/** Interpolates a 3-step depth table (active, previous, furthest) at a fractional level. */
function depthAt(table: readonly number[], level: number) {
  const i = Math.min(Math.floor(level), table.length - 2)
  return lerp(table[i], table[i + 1], level - i)
}

interface Props {
  reducedMotion: boolean
}

/**
 * Section 02: the background frame stays locked to the viewport while three
 * cards rise, decelerate into place and stack with physical depth.
 * Every style is a pure function of scroll progress, so it reverses exactly.
 */
export function BenefitsSection({ reducedMotion }: Props) {
  const c = content.world
  const isMobile = useIsMobile()
  const trackRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const fadeRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])

  useScrollProgress(
    trackRef,
    (p) => {
      const vh = window.innerHeight
      const bg = bgRef.current
      if (bg) {
        bg.style.opacity = easeOut(range(p, W.bgIn as [number, number])).toFixed(3)
        bg.style.transform = `scale(${lerp(W.bgScale[0], W.bgScale[1], p).toFixed(4)})`
      }
      if (fadeRef.current) fadeRef.current.style.opacity = easeIn(range(p, W.bgOut as [number, number])).toFixed(3)

      const intro = introRef.current
      if (intro) {
        const i = easeOut(range(p, W.introIn as [number, number]))
        const o = easeInOut(range(p, W.introOut as [number, number]))
        intro.style.opacity = (i * (1 - o)).toFixed(3)
        intro.style.transform = `translate3d(0, ${((1 - i) * 32 - o * 64).toFixed(1)}px, 0) scale(${(1 - o * 0.04).toFixed(4)})`
        intro.style.visibility = i * (1 - o) < 0.01 ? 'hidden' : 'visible'
      }

      // Each card: rise from below with a decelerating ease, then recede
      // (scale down, lift, dim) as later cards land on top of it.
      const entered = W.cardIn.map((w) => easeOut(range(p, w as [number, number])))
      cardRefs.current.forEach((card, i) => {
        if (!card) return
        const t = entered[i]
        const level = entered.slice(i + 1).reduce((a, b) => a + b, 0)
        const scale = depthAt(W.depth.scales, level)
        const y = (1 - t) * vh * 0.9 + depthAt(W.depth.offsetY, level) * (isMobile ? 0.6 : 1)
        card.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`
        card.style.setProperty('--dim', depthAt(W.depth.dim, level).toFixed(3))
        card.style.visibility = t <= 0.001 ? 'hidden' : 'visible'
        card.toggleAttribute('inert', t < 0.98 || level > 0.5)
      })

      const stack = stackRef.current
      if (stack) {
        const e = easeIn(range(p, W.exit as [number, number]))
        stack.style.transform = `translate3d(0, ${(-e * vh * 0.7).toFixed(1)}px, 0) scale(${(1 - e * 0.06).toFixed(4)})`
        stack.style.opacity = (1 - e).toFixed(3)
      }
    },
    !reducedMotion,
  )

  return (
    <section
      id={SECTION_IDS.world}
      ref={trackRef}
      className={`world${reducedMotion ? ' world--static' : ''}`}
      style={{ ['--track' as string]: `${isMobile ? W.scrollLengthMobile : W.scrollLength}svh` }}
      aria-labelledby="world-title"
    >
      <div className="world__sticky">
        <div className="world__bg" ref={bgRef} aria-hidden="true">
          <img src={ASSETS.card4} alt="" decoding="async" />
        </div>
        <div className="world__shade" aria-hidden="true" />
        <div className="world__fade" ref={fadeRef} aria-hidden="true" />

        <header className="world__intro container" ref={introRef}>
          <p className="eyebrow eyebrow--accent">{c.eyebrow}</p>
          <SplitHeadline lines={c.headline} id="world-title" className="display display--xl" />
          <p className="lead">{c.description}</p>
        </header>

        <div className="world__stack" ref={stackRef}>
          {c.cards.map((card, i) => (
            <StickyCard
              key={card.eyebrow}
              index={i}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              {...card}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
