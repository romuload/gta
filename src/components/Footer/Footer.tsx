import { content, ASSETS } from '../../config/content'
import { product } from '../../config/product'
import { scrollToSection } from '../../lib/scroll'
import { SplitHeadline } from '../SplitHeadline/SplitHeadline'
import './Footer.css'

const SOCIAL_LABELS = { instagram: 'Instagram', youtube: 'YouTube', x: 'X' } as const

export function Footer() {
  const c = content.footer
  const social = (Object.keys(SOCIAL_LABELS) as (keyof typeof SOCIAL_LABELS)[]).filter((k) => product.social[k])
  const legalUrls = [product.legal.privacy, product.legal.terms, product.legal.legal]

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <SplitHeadline lines={c.headline} className="display display--l" />
          <p className="lead">{c.description}</p>
        </div>

        <div className="footer__row">
          <nav aria-label={c.navLabel}>
            <ul className="footer__nav">
              {c.nav.map((n) => (
                <li key={n.target}>
                  <a
                    href={`#${n.target}`}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection(n.target)
                    }}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {social.length > 0 && (
            <ul className="footer__social" aria-label={c.socialLabel}>
              {social.map((k) => (
                <li key={k}>
                  <a href={product.social[k]!} target="_blank" rel="noopener noreferrer">
                    {SOCIAL_LABELS[k]}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <ul className="footer__logos" aria-label="Brands">
            <li><img src={ASSETS.logo} alt="Grand Theft Auto VI" width={56} height={43} /></li>
            <li><img src={ASSETS.rockstar} alt="Rockstar Games" width={28} height={28} /></li>
          </ul>
        </div>

        <div className="footer__legal">
          <ul aria-label={c.legalLabel}>
            {c.legal.map((l, i) => (
              <li key={l}>{legalUrls[i] ? <a href={legalUrls[i]!}>{l}</a> : <span>{l}</span>}</li>
            ))}
          </ul>
          <div className="footer__copy">
            <p>{c.copyright}</p>
            <p>{c.disclaimer}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
