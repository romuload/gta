import { useEffect } from 'react'
import { ASSETS } from './config/content'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useHeroAssets } from './hooks/useHeroAssets'
import { ScrollTrigger } from './lib/gsap'
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen'
import { Header } from './components/Header/Header'
import { HeroSection } from './components/HeroSection/HeroSection'
import { BenefitsSection } from './components/BenefitsSection/BenefitsSection'
import { ProductExperience } from './components/ProductExperience/ProductExperience'
import { ProductShowcase } from './components/ProductShowcase/ProductShowcase'
import { ProductJourney } from './components/ProductJourney/ProductJourney'
import { Footer } from './components/Footer/Footer'

export default function App() {
  const reducedMotion = useReducedMotion()
  // The scroll video is only needed when motion is allowed.
  const hero = useHeroAssets(ASSETS.heroVideo, !reducedMotion)

  // Any layout height change (breakpoints, fonts, lazy images) re-measures every track.
  useEffect(() => {
    let t = 0
    let last = document.body.scrollHeight
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight
      if (h === last) return
      last = h
      window.clearTimeout(t)
      t = window.setTimeout(() => ScrollTrigger.refresh(), 120)
    })
    ro.observe(document.body)
    return () => {
      ro.disconnect()
      window.clearTimeout(t)
    }
  }, [])

  // Decode later-section images while idle, so their first paint never stalls a scroll frame.
  useEffect(() => {
    if (!hero.ready) return
    const urls = [ASSETS.card4, ASSETS.card1, ASSETS.card2, ASSETS.card3, ASSETS.heroStill]
    const run = () =>
      urls.forEach((src) => {
        const img = new Image()
        img.src = src
        img.decode().catch(() => {})
      })
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300))
    ric(run)
  }, [hero.ready])

  useEffect(() => {
    if (!hero.ready) return
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [hero.ready])

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <LoadingScreen progress={hero.progress} done={hero.ready} />
      <Header />
      <main id="main">
        <HeroSection videoSrc={hero.src} ready={hero.ready} reducedMotion={reducedMotion} />
        <BenefitsSection reducedMotion={reducedMotion} />
        <ProductJourney reducedMotion={reducedMotion}>
          <ProductExperience reducedMotion={reducedMotion} />
          <ProductShowcase reducedMotion={reducedMotion} />
        </ProductJourney>
      </main>
      <Footer />
    </>
  )
}
