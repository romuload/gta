import { useEffect, useState } from 'react'
import { content, ASSETS } from '../../config/content'
import './LoadingScreen.css'

interface Props {
  /** 0–1 real progress, or null when the total size is unknown. */
  progress: number | null
  done: boolean
}

export function LoadingScreen({ progress, done }: Props) {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('is-loading', !done)
    if (!done) return
    const t = window.setTimeout(() => setGone(true), 900)
    return () => window.clearTimeout(t)
  }, [done])

  if (gone) return null
  const pct = progress === null ? null : Math.round(progress * 100)

  return (
    <div className={`loader${done ? ' is-done' : ''}`} role="status" aria-live="polite" aria-busy={!done}>
      <img className="loader__logo" src={ASSETS.logo} alt="" width={120} height={93} />
      <p className="loader__label">{content.loading.label}</p>
      <div
        className="loader__bar"
        role="progressbar"
        aria-label={content.loading.label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct ?? undefined}
      >
        <span
          className={`loader__fill${pct === null ? ' is-indeterminate' : ''}`}
          style={pct === null ? undefined : { transform: `scaleX(${pct / 100})` }}
        />
      </div>
      {pct !== null && <p className="loader__pct" aria-hidden="true">{String(pct).padStart(2, '0')}%</p>}
    </div>
  )
}
