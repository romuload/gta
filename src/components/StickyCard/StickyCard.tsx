import { forwardRef } from 'react'
import { SplitHeadline } from '../SplitHeadline/SplitHeadline'
import './StickyCard.css'

interface Props {
  eyebrow: string
  headline: readonly string[]
  description: string
  image: string
  alt: string
  index: number
}

export const StickyCard = forwardRef<HTMLElement, Props>(function StickyCard(
  { eyebrow, headline, description, image, alt, index },
  ref,
) {
  return (
    <article ref={ref} className="sticky-card" aria-labelledby={`card-${index}-title`}>
      <div className="sticky-card__text">
        <p className="eyebrow eyebrow--accent">{eyebrow}</p>
        <SplitHeadline lines={headline} as="h3" className="display display--m" id={`card-${index}-title`} />
        <p className="body">{description}</p>
      </div>
      <figure className="sticky-card__media">
        <img src={image} alt={alt} decoding="async" width={1376} height={768} />
      </figure>
    </article>
  )
})
