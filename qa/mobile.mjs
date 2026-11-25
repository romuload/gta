// Mobile hero/transition check: iPhone-sized viewport, touch, 4x CPU throttle.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
const SITE = process.env.SITE ?? 'http://localhost:5173/'
const OUT = new URL('./shots/mobile/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-gpu', '--ignore-gpu-blocklist'] })
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
const cdp = await ctx.newCDPSession(page)
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const bytes = { seq: 0, n: 0 }
page.on('response', async (r) => {
  if (r.url().includes('/sequence/')) { bytes.n++; bytes.seq += Number(r.headers()['content-length'] || 0) }
})
const t0 = Date.now()
await page.goto(SITE)
await page.waitForFunction(() => !document.body.classList.contains('is-loading'), null, { timeout: 60000 })
const loaderMs = Date.now() - t0
await page.waitForTimeout(1500)

// 1) Fast flick-like scrubbing through the hero: is a frame always drawn?
const samples = await page.evaluate(async () => {
  const hero = document.getElementById('home')
  const len = hero.offsetHeight - innerHeight
  const out = []
  for (const p of [0.1, 0.35, 0.6, 0.85, 1, 0.5, 0.05]) {
    scrollTo(0, len * p)
    await new Promise((r) => setTimeout(r, 120))
    const c = document.querySelector('.hero__video canvas')
    out.push({ p, frame: c?.dataset.frame ?? 'none' })
  }
  return out
})

// 2) Brightness sweep from mid-hero to the start of Section 03 (finds black gaps).
const ranges = await page.evaluate(() => {
  const top = (id) => document.getElementById(id).getBoundingClientRect().top + scrollY
  const heroEnd = top('the-world') - innerHeight
  return { from: heroEnd - innerHeight * 0.5, to: top('experience') + innerHeight * 0.3, vh: innerHeight }
})
const lum = []
let k = 0
for (let y = ranges.from; y <= ranges.to; y += ranges.vh * 0.25) {
  await page.evaluate((y) => scrollTo(0, y), y)
  await page.waitForTimeout(250)
  const f = `${OUT}sweep_${String(k++).padStart(2, '0')}.png`
  await page.screenshot({ path: f })
  const y_ = execSync(`ffmpeg -v info -i ${f} -vf "scale=64:-1,signalstats,metadata=print:key=lavfi.signalstats.YAVG" -f null - 2>&1 | grep -o 'YAVG=[0-9.]*' | head -1`).toString().trim()
  lum.push(`${Math.round((y - ranges.from) / ranges.vh * 100) / 100}vh:${y_.replace('YAVG=', '')}`)
}
console.log(JSON.stringify({ loaderMs, seqRequestsBeforeSweep: bytes.n, seqKB: Math.round(bytes.seq / 1024), samples, luminance: lum, errors }, null, 1))
await b.close()
