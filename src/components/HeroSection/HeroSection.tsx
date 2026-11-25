import { useLayoutEffect, useRef } from 'react'
import { content, ASSETS, SECTION_IDS } from '../../config/content'
import { motion } from '../../config/motion'
import { gsap } from '../../lib/gsap'
import { range, piecewise, easeIn } from '../../lib/math'
import { scrollToSection } from '../../lib/scroll'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { useIsMobile } from '../../hooks/useMediaQuery'
import { ScrollSequence, type ScrollSequenceHandle } from '../ScrollSequence/ScrollSequence'
import type { FrameSequence } from '../../lib/frameSequence'
import './HeroSection.css'

interface Props {
  seq: FrameSequence | null
  ready: boolean
  reducedMotion: boolean
}

export function HeroSection({ seq, ready, reducedMotion }: Props) {
  const c = content.hero
  const m = motion.hero
  const isMobile = useIsMobile()
  const trackRef = useRef<HTMLElement>(null)
  const seqRef = useRef<ScrollSequenceHandle>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const exitRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)

  const scrubbing = !reducedMotion

  useScrollProgress(
    trackRef,
    (p) => {
      seqRef.current?.setFrame(piecewise(p, m.timeline) * m.sequence.fps)
      const fade = range(p, [m.textHoldEnd, m.textFadeEnd])
      // Phones: once the copy is gone, the image band glides to the centre.
      trackRef.current?.style.setProperty('--hero-fade', fade.toFixed(3))
      if (contentRef.current) {
        contentRef.current.style.opacity = String(1 - fade)
        contentRef.current.style.transform = `translate3d(0, ${-fade * 48}px, 0)`
        contentRef.current.style.visibility = fade >= 1 ? 'hidden' : 'visible'
      }
      if (exitRef.current) exitRef.current.style.opacity = String(easeIn(range(p, [m.exitFadeStart, 1])) * m.exitFadeMax)
    },
    scrubbing,
  )

  // Entrance choreography, once assets are ready.
  useLayoutEffect(() => {
    if (!ready || !introRef.current) return
    const i = motion.intro
    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set('[data-intro]', { opacity: 1, y: 0, yPercent: 0 })
        return
      }
      const tl = gsap.timeline({ defaults: { ease: motion.ease.expoOut, duration: i.duration } })
      tl.fromTo('[data-intro="eyebrow"]', { opacity: 0, y: 12 }, { opacity: 1, y: 0 }, i.eyebrowDelay)
        .fromTo('[data-intro="line"]', { yPercent: 105 }, { yPercent: 0, stagger: i.headlineStagger }, i.headlineDelay)
        .fromTo('[data-intro="desc"]', { opacity: 0, y: 16 }, { opacity: 1, y: 0 }, i.descriptionDelay)
        .fromTo('[data-intro="cta"]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.08 }, i.ctaDelay)
    }, introRef)
    return () => ctx.revert()
  }, [ready, reducedMotion])

  return (
    <section
      id={SECTION_IDS.home}
      ref={trackRef}
      className={`hero${reducedMotion ? ' hero--static' : ''}`}
      style={{ ['--track' as string]: `${isMobile ? m.scrollLengthMobile : m.scrollLength}svh` }}
      aria-labelledby="hero-title"
    >
      <div className="hero__sticky">
        {reducedMotion ? (
          <img className="hero__still" src={ASSETS.heroStill} alt={c.stillAlt} />
        ) : (
          <ScrollSequence
            ref={seqRef}
            seq={seq}
            poster={ASSETS.heroPoster}
            label={c.videoLabel}
            lerp={m.scrubLerp}
            focus={(f) => piecewise(f, m.focus)}
            className="hero__video"
          />
        )}
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__exit" ref={exitRef} aria-hidden="true" />

        <div className="hero__content container" ref={contentRef}>
          <div className="hero__grid" ref={introRef}>
            <div className="hero__title">
              <p className="eyebrow" data-intro="eyebrow">{c.eyebrow}</p>
              <h1 id="hero-title" className="display display--xl">
                {c.headline.map((line) => (
                  <span className="mask-line" key={line}>
                    <span data-intro="line">{line}</span>
                  </span>
                ))}
              </h1>
            </div>
            <div className="hero__side">
              <p className="lead" data-intro="desc">{c.description}</p>
              <div className="hero__actions">
                <a
                  href={`#${c.cta.target}`}
                  className="btn btn--primary"
                  data-intro="cta"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection(c.cta.target)
                  }}
                >
                  {c.cta.label}
                  <span className="btn__arrow" aria-hidden="true">→</span>
                </a>
                {!reducedMotion && (
                  <span className="hero__scroll" data-intro="cta" aria-hidden="true">
                    <span className="hero__scroll-line" />
                    {c.scroll}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
