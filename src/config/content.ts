// All on-page copy lives here. Components read from this file only.

export const SECTION_IDS = {
  home: 'home',
  world: 'the-world',
  experience: 'experience',
  buy: 'get-the-game',
} as const

/** Public asset URL that respects the deploy base path (e.g. /gta/ on GitHub Pages). */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export const ASSETS = {
  logo: asset('assets/logos/gta6-logo.svg'),
  viMark: asset('assets/logos/vi-mark.svg'),
  ps5: asset('assets/logos/ps5.svg'),
  xbox: asset('assets/logos/xbox-series.svg'),
  rockstar: asset('assets/logos/rockstar.svg'),
  esrb: asset('assets/logos/esrb-m.svg'),
  heroVideo: asset('assets/videos/hero-scrub.mp4'),
  heroPoster: asset('assets/images/hero-poster.jpg'),
  heroStill: asset('assets/images/hero-still.jpg'),
  card1: asset('assets/images/card1.jpg'),
  card2: asset('assets/images/card2.jpg'),
  card3: asset('assets/images/card3.jpg'),
  card4: asset('assets/images/card4.jpg'),
  caseModel: asset('assets/models/gta6-case.glb'),
}

export const content = {
  loading: {
    label: 'Entering Vice City',
  },

  header: {
    nav: [
      { label: 'Home', target: SECTION_IDS.home },
      { label: 'The World', target: SECTION_IDS.world },
      { label: 'Experience', target: SECTION_IDS.experience },
    ],
    cta: { label: 'Get the Game', target: SECTION_IDS.buy },
    logoAlt: 'Grand Theft Auto VI',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
  },

  hero: {
    eyebrow: 'Grand Theft Auto VI',
    headline: ['Welcome to', 'Vice City.'],
    description:
      'A new era begins in the state of Leonida. From the neon-soaked streets of Vice City to the wild landscapes beyond, discover a world where every choice takes you further.',
    cta: { label: 'Explore the World', target: SECTION_IDS.world },
    scroll: 'Scroll to explore',
    videoLabel:
      'Cinematic sequence: a man walks to a grey sports car on a palm-lined Vice City street at sunset, gets in, starts the engine and drives away.',
    stillAlt: 'A man stands beside a grey sports car on a palm-lined Vice City boulevard at sunset.',
  },

  world: {
    eyebrow: 'The World of Leonida',
    headline: ['A World', 'Without Limits.'],
    description:
      'From neon-lit streets to untamed landscapes, Leonida is a world of possibilities. Explore its streets, meet its people and discover what lies beyond the city lights.',
    backgroundAlt: 'Ocean Drive at dusk with neon hotel signs, palm trees and traffic.',
    cards: [
      {
        eyebrow: '01 / The World',
        headline: ['A World That', 'Never Stands Still.'],
        description:
          'Explore the neon-soaked streets of Vice City, tropical coastlines, sprawling neighborhoods and the untamed landscapes of Leonida.',
        image: ASSETS.card1,
        alt: 'A red muscle car cruising down a neon-lit Vice City boulevard lined with hotels and palm trees.',
      },
      {
        eyebrow: '02 / The Action',
        headline: ['Live on', 'the Edge.'],
        description:
          'High-speed pursuits, dangerous encounters and unexpected opportunities. Every moment can take you somewhere you never planned to go.',
        image: ASSETS.card2,
        alt: 'A muscle car speeding along Ocean Drive past glowing neon signs and crowded sidewalks.',
      },
      {
        eyebrow: '03 / The Story',
        headline: ['Two Lives.', 'One Way Out.'],
        description:
          'Jason and Lucia find themselves caught in a world where loyalty, ambition and survival are put to the test.',
        image: ASSETS.card3,
        alt: 'A striped red muscle car heads downtown at golden hour, the skyline ahead.',
      },
    ],
  },

  experience: {
    eyebrow: 'The Next Chapter',
    headline: ['More Than', 'a Game.'],
    description:
      'A new chapter in Grand Theft Auto. Step into a world built around unforgettable characters, extraordinary places and endless possibilities.',
    ringText: 'Welcome to Leonida  ✦  More than a game  ✦  Grand Theft Auto VI  ✦  ',
    blocks: [
      {
        eyebrow: '01 / A New Era',
        headline: ['The Next', 'Generation.'],
        description:
          'Discover a new chapter of Grand Theft Auto, set in the vibrant and unpredictable state of Leonida.',
        side: 'left',
      },
      {
        eyebrow: '02 / Discover',
        headline: ['Every Detail', 'Tells a Story.'],
        description:
          'From the streets of Vice City to the landscapes beyond, discover a world filled with character, atmosphere and unexpected moments.',
        side: 'right',
      },
      {
        eyebrow: '03 / Your Experience',
        headline: ['Your World.', 'Your Rules.'],
        description:
          'Explore at your own pace, take unexpected paths and experience the world of Grand Theft Auto in your own way.',
        side: 'left',
      },
    ] as const,
    drag: 'Drag to explore',
    modelLabel: 'Interactive 3D model of the Grand Theft Auto VI PlayStation 5 case. Drag to rotate.',
  },

  showcase: {
    eyebrow: 'Grand Theft Auto VI',
    headline: ['Your Story', 'Starts Here.'],
    productTitle: 'Grand Theft Auto VI',
    description:
      'Return to Vice City and explore the state of Leonida in a new chapter of Grand Theft Auto. Experience the intertwined stories of Jason and Lucia as they navigate a world of ambition, danger and unexpected possibilities.',
    platformLabel: 'Select your platform',
    formatLabel: 'Select your format',
    editionLabel: 'Select your edition',
    priceLabel: 'Price',
    priceUnavailable: 'Price not yet announced',
    primaryCta: 'Get the Game',
    secondaryCta: 'Add to Bag',
    fallbackCta: 'Notify Me',
    drag: 'Drag to explore',
    packagingNote: 'The 3D packaging shown is the PlayStation 5 edition.',
    demoNotice: 'Demo only: notifications are not connected yet and no data was collected. This concept store processes no purchases or payments.',
    backgroundAlt: '',
  },

  footer: {
    headline: ['See You in', 'Vice City.'],
    description: 'Stay connected for more from the world of Grand Theft Auto VI.',
    nav: [
      { label: 'Home', target: SECTION_IDS.home },
      { label: 'The World', target: SECTION_IDS.world },
      { label: 'Experience', target: SECTION_IDS.experience },
      { label: 'Get the Game', target: SECTION_IDS.buy },
    ],
    navLabel: 'Footer',
    socialLabel: 'Social',
    legalLabel: 'Legal',
    legal: ['Privacy Policy', 'Terms of Service', 'Legal Information'],
    copyright: 'Grand Theft Auto and Rockstar Games are trademarks of their respective owners.',
    disclaimer:
      'Unofficial concept website created for educational and portfolio purposes. Not affiliated with Rockstar Games or Take-Two Interactive.',
  },
}
