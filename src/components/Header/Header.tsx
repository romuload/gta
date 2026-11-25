import { useEffect, useState } from 'react'
import { content, ASSETS, SECTION_IDS } from '../../config/content'
import { scrollToSection } from '../../lib/scroll'
import './Header.css'

export function Header() {
  const [open, setOpen] = useState(false)
  const { nav, cta, logoAlt, menuOpen, menuClose } = content.header

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    scrollToSection(id)
  }

  return (
    <header className={`header${open ? ' is-open' : ''}`}>
      <div className="header__inner container">
        <nav className="header__nav" aria-label="Primary">
          <ul>
            {nav.map((item) => (
              <li key={item.target}>
                <a href={`#${item.target}`} onClick={go(item.target)} className="header__link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          className="header__burger"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? menuClose : menuOpen}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>

        <a href={`#${SECTION_IDS.home}`} className="header__brand" onClick={go(SECTION_IDS.home)}>
          <img src={ASSETS.logo} alt={logoAlt} width={96} height={74} />
        </a>

        <div className="header__cta">
          <a href={`#${cta.target}`} className="btn btn--primary btn--sm" onClick={go(cta.target)}>
            {cta.label}
          </a>
        </div>
      </div>

      <div id="mobile-menu" className="header__menu" hidden={!open}>
        <ul>
          {nav.map((item) => (
            <li key={item.target}>
              <a href={`#${item.target}`} onClick={go(item.target)} className="display display--m">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
