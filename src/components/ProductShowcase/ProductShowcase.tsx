import { useEffect, useRef, useState } from 'react'
import { content, ASSETS, SECTION_IDS } from '../../config/content'
import { product, type PlatformId, type FormatId } from '../../config/product'
import { SplitHeadline } from '../SplitHeadline/SplitHeadline'
import { PlatformSelector, OptionSelector } from '../PlatformSelector/PlatformSelector'
import './ProductShowcase.css'

import { motion } from '../../config/motion'
import { productStore } from '../../lib/productStore'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { useModelDrag } from '../../hooks/useModelDrag'

interface Props {
  reducedMotion: boolean
}

export function ProductShowcase({ reducedMotion }: Props) {
  const c = content.showcase
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  // This slot is where the shared 3D case comes to rest.
  useEffect(() => {
    productStore.anchor = stageRef.current
    return () => {
      productStore.anchor = null
    }
  }, [])
  useModelDrag(stageRef)
  useScrollProgress(
    sectionRef,
    (h) => {
      productStore.h = h
    },
    !reducedMotion,
    motion.product.handoff,
  )
  const [platform, setPlatform] = useState<PlatformId>('ps5')
  const [format, setFormat] = useState<FormatId>('physical')
  const [edition, setEdition] = useState(product.editions[0].id)
  const [notice, setNotice] = useState<string | null>(null)

  const current = product.platforms.find((p) => p.id === platform)!
  const currentFormat = current.formats.find((f) => f.id === format) ?? current.formats[0]
  const currentEdition = product.editions.find((e) => e.id === edition) ?? product.editions[0]
  const formatNote = currentFormat.note
  const hasPrice = product.price !== null
  const purchasable = product.available && hasPrice && !!product.checkoutUrl
  const price = hasPrice
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price!)
    : null

  const demo = () => setNotice(c.demoNotice)

  return (
    <section id={SECTION_IDS.buy} ref={sectionRef} className="showcase" aria-labelledby="showcase-title">
      <div className="showcase__bg" aria-hidden="true">
        <img src={ASSETS.heroStill} alt="" decoding="async" />
      </div>

      <div className="showcase__inner container">
        <header className="showcase__intro">
          <p className="eyebrow eyebrow--accent">{c.eyebrow}</p>
          <SplitHeadline lines={c.headline} id="showcase-title" className="display display--l" />
          <p className="body">{c.description}</p>
        </header>

        <div
          className="showcase__stage"
          ref={stageRef}
          tabIndex={0}
          role="img"
          aria-label={content.experience.modelLabel}
        >
          <p className="showcase__drag eyebrow" aria-hidden="true">
            <span className="showcase__drag-icon" />
            {c.drag}
          </p>
        </div>

        <aside className="showcase__buy" aria-labelledby="showcase-product">
          <div className="showcase__head">
            <img className="showcase__thumb" src={ASSETS.logo} alt="" width={56} height={43} />
            <div>
              <h3 className="showcase__title" id="showcase-product">{c.productTitle}</h3>
              <p className="showcase__summary" aria-live="polite">
                {[current.label, currentFormat.label, currentEdition.label].map((part, i, all) => (
                  <span key={part}>
                    <span className="nowrap">{i < all.length - 1 ? `${part} ·` : part}</span>
                    {i < all.length - 1 && ' '}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <PlatformSelector
            label={c.platformLabel}
            platforms={product.platforms}
            value={platform}
            onChange={(id) => {
              setPlatform(id)
              setNotice(null)
            }}
          />
          <div className="showcase__group">
            <OptionSelector
              label={c.formatLabel}
              name="format"
              options={current.formats.map((f) => ({ id: f.id, label: f.label }))}
              value={format}
              onChange={(id) => {
                setFormat(id)
                setNotice(null)
              }}
            />
            {formatNote && <p className="showcase__note">{formatNote}</p>}
          </div>
          <OptionSelector
            label={c.editionLabel}
            name="edition"
            options={product.editions}
            value={edition}
            onChange={setEdition}
          />

          <div className="showcase__checkout">
            <div className="showcase__price">
              <span className="eyebrow">{c.priceLabel}</span>
              <span className={hasPrice ? 'showcase__amount' : 'showcase__tba'}>{price ?? c.priceUnavailable}</span>
            </div>
            <div className="showcase__ctas">
              {purchasable ? (
                <>
                  <a className="btn btn--primary" href={product.checkoutUrl!}>
                    {c.primaryCta}
                  </a>
                  <button className="btn btn--outline" type="button">
                    {c.secondaryCta}
                  </button>
                </>
              ) : (
                <button className="btn btn--primary" type="button" onClick={demo} aria-describedby="showcase-status">
                  {c.fallbackCta}
                  <span className="btn__arrow" aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </div>
          <p className="showcase__status" id="showcase-status" role="status" aria-live="polite">
            {notice ?? (platform === 'xbox' ? c.packagingNote : '')}
          </p>
        </aside>

        <ul className="showcase__logos" aria-label="Platforms and rating">
          <li><img src={ASSETS.rockstar} alt="Rockstar Games" /></li>
          <li><img src={ASSETS.viMark} alt="Grand Theft Auto VI" /></li>
          <li><img src={ASSETS.ps5} alt="PlayStation 5" /></li>
          <li><img src={ASSETS.xbox} alt="Xbox Series X|S" /></li>
          <li><img src={ASSETS.esrb} alt="ESRB rating: Mature 17+" /></li>
        </ul>
      </div>
    </section>
  )
}
