import { asset } from './content'

// Commercial configuration. Nothing here is invented: when a value is unknown
// it is `null`, and the UI hides it and falls back to "Notify Me".

export type PlatformId = 'ps5' | 'xbox'
export type FormatId = 'physical' | 'digital'

export interface PlatformOption {
  id: PlatformId
  label: string
  logo: string
  formats: { id: FormatId; label: string; note?: string }[]
}

export const product = {
  title: 'Grand Theft Auto VI',
  /** Set to a number (e.g. 69.99) once an official price exists. */
  price: null as number | null,
  currency: 'USD',
  /** Set to true only when a real checkout integration exists. */
  available: false,
  /** Real checkout endpoint. Null = CTAs render in demo mode. */
  checkoutUrl: null as string | null,
  platforms: [
    {
      id: 'ps5',
      label: 'PlayStation 5',
      logo: asset('assets/logos/ps5.svg'),
      formats: [
        { id: 'physical', label: 'Physical disc' },
        { id: 'digital', label: 'Digital' },
      ],
    },
    {
      id: 'xbox',
      label: 'Xbox Series X|S',
      logo: asset('assets/logos/xbox-series.svg'),
      formats: [
        // Xbox Series S has no disc drive, so the disc is Series X only.
        { id: 'physical', label: 'Physical disc', note: 'Disc plays on Xbox Series X only' },
        { id: 'digital', label: 'Digital', note: 'Xbox Series X and Series S' },
      ],
    },
  ] as PlatformOption[],
  editions: [{ id: 'standard', label: 'Standard Edition' }],
  /** Official social URLs. Leave null until configured; links without a URL are not rendered. */
  social: {
    instagram: null as string | null,
    youtube: null as string | null,
    x: null as string | null,
  },
  /** Legal page URLs. Null = rendered as plain text, not as fake links. */
  legal: {
    privacy: null as string | null,
    terms: null as string | null,
    legal: null as string | null,
  },
}
