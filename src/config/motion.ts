// Every scroll length, timing window and easing used by the page.

export const motion = {
  ease: {
    out: 'power3.out',
    inOut: 'power2.inOut',
    expoOut: 'expo.out',
  },

  intro: {
    eyebrowDelay: 0.1,
    headlineDelay: 0.2,
    headlineStagger: 0.12,
    descriptionDelay: 0.55,
    ctaDelay: 0.7,
    duration: 1.1,
  },

  hero: {
    /** Scroll track height (vh). The sticky viewport is 100svh inside it. */
    scrollLength: 320,
    scrollLengthMobile: 260,
    /**
     * Scroll progress → video time (seconds), mapped to the actual 8s clip:
     * 0.0s walks to the car · 1.3s opens the door · 2.0s gets in ·
     * 2.7–4.6s inside, starts the engine · 5.3s pulls away · 8.0s driving off.
     */
    timeline: [
      [0, 0],
      [0.25, 2.0],
      [0.5, 4.2],
      [0.75, 5.6],
      [1, 8.0],
    ] as [number, number][],
    /** Copy stays fully visible until `textHoldEnd`, gone by `textFadeEnd`. */
    textHoldEnd: 0.06,
    textFadeEnd: 0.24,
    /** Last stretch dims the frame (never to full black) as Section 02 rises over it. */
    exitFadeStart: 0.86,
    exitFadeMax: 0.55,
    /** Smoothing for the frame chase (0–1, per frame). */
    scrubLerp: 0.25,
    /** Hero image sequence (extracted from the 8s, 24fps clip). */
    sequence: { frames: 193, fps: 24, coarseEvery: 8 },
    /**
     * Where the action is in each part of the clip (source frame → fraction of
     * the frame width). Narrow screens centre their crop here, so the
     * character, then the car, stay in shot.
     */
    focus: [[0, 0.64], [31, 0.6], [48, 0.56], [72, 0.62], [96, 0.68], [130, 0.62], [150, 0.55], [170, 0.5], [192, 0.47]] as [number, number][],
  },

  world: {
    scrollLength: 440,
    scrollLengthMobile: 360,
    // Progress windows on the section's own 0–1 track
    /** Title fades in while the section rises into view (entry progress). */
    introIn: [0.35, 1],
    /** Section title steps back as the first card arrives. */
    introOut: [0.13, 0.24],
    cardIn: [
      [0.12, 0.3],
      [0.34, 0.52],
      [0.56, 0.74],
    ],
    exit: [0.86, 0.98],
    /** Background dims (never to black) as Section 03 rises over it. */
    bgOut: [0.88, 1],
    bgOutMax: 0.7,
    /** Slow push-in on the locked background across the whole track. */
    bgScale: [1.08, 1],
    depth: {
      scales: [1, 0.96, 0.92],
      offsetY: [0, -28, -56],
      dim: [0, 0.25, 0.45],
    },
  },

  product: {
    scrollLength: 480,
    scrollLengthMobile: 420,
    phases: {
      entrance: [0, 0.15],
      reveal: [0.15, 0.35],
      opening: [0.35, 0.55],
      inside: [0.55, 0.75],
      closing: [0.75, 0.9],
      handoff: [0.9, 1],
    },
    blocks: [
      [0.17, 0.33],
      [0.37, 0.53],
      [0.57, 0.73],
    ],
    /** Opening headline: in while the section rises (entry progress), out before block 01. */
    intro: { in: [0.3, 1], out: [0.14, 0.19] },
    /** Each block fades in over the first 25% of its window and out over the last 25%. */
    blockFade: 0.25,
    /** Hinge opening (radians). Stops before the lid hits the spine. */
    openAngle: 2.72,
    /**
     * Model keyframes on Section 03 progress. Pure functions of scroll, so
     * every state is reversible. y is a fraction of the visible height.
     */
    keys: {
      y: [[0, 0.9], [0.15, 0], [0.9, 0], [1, -0.04]],
      /** Horizontal drift (fraction of visible width) away from the active text block. */
      x: [[0.15, 0], [0.2, 0.05], [0.31, 0.05], [0.37, 0], [0.41, -0.07], [0.53, -0.07], [0.58, 0.06], [0.73, 0.06], [0.78, 0]],
      z: [[0, -5], [0.15, 0]],
      scale: [[0, 0.5], [0.15, 1]],
      rotX: [[0, 0.6], [0.15, 0.12], [0.35, 0.04], [0.55, 0.16], [0.75, 0.12], [0.9, 0.02], [1, 0.04]],
      rotY: [[0, -1.1], [0.15, -0.38], [0.33, 0.62], [0.45, 0.2], [0.55, -0.12], [0.75, 0.42], [0.9, -0.1], [1, -0.3]],
      rotZ: [[0, 0.42], [0.15, 0.04], [0.3, 0]],
      open: [[0.37, 0], [0.55, 1], [0.75, 1], [0.89, 0]],
    } as Record<string, [number, number][]>,
    /** Text ring that orbits the case (wireframe frames 2–4). */
    ring: {
      visible: [0.03, 0.13],
      exit: [0.15, 0.23],
      turns: 1.6,
    },
    /** Section 04 hand-off: showcase top from viewport bottom → top. */
    handoff: { start: 'top bottom', end: 'top top' },
    /** Size of the closed case as a fraction of the visible height. */
    fit: { desktop: 0.6, mobile: 0.4, openWidthDesktop: 0.42, openWidthMobile: 0.9 },
    drag: {
      sensitivity: 0.006,
      maxTiltX: 0.45,
      returnLerp: 0.06,
    },
  },
}

export type Range = readonly [number, number]
