# GTA VI — Welcome to Vice City (concept)

Unofficial cinematic landing page concept for Grand Theft Auto VI, built for educational and portfolio purposes.
Not affiliated with Rockstar Games or Take-Two Interactive. Grand Theft Auto and Rockstar Games are trademarks of their respective owners.

**Live:** https://romuload.github.io/gta/

## Stack

Vite · React · TypeScript · GSAP ScrollTrigger · Three.js / React Three Fiber

- Scroll-scrubbed hero video (all-intra H.264, loaded as a Blob for frame-accurate seeking)
- Sticky stacked cards driven purely by scroll progress (fully reversible)
- One shared WebGL canvas: the PS5 case modelled in Blender drops in, opens on its hinge, shows the disc, closes and docks into the product section
- `prefers-reduced-motion` support, keyboard navigation, responsive from 360px to 1920px

## Develop

```bash
npm install
npm run dev
```

`npm run qa` runs the Playwright QA pass (breakpoints, navigation, reduced motion, frame timing) against the dev server.
