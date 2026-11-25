import { chromium } from 'playwright-core'
const SITE = process.env.SITE ?? 'http://localhost:5173/'
const OUT = new URL('./shots/', import.meta.url).pathname
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-gpu'] })
for (const [w, h] of [[390, 844], [360, 740]]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })).newPage()
  await page.goto(SITE)
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'))
  await page.waitForTimeout(3500)
  for (const p of [0, 0.15, 0.35, 0.6, 0.85, 1]) {
    await page.evaluate((p) => scrollTo(0, (document.getElementById('home').offsetHeight - innerHeight) * p), p)
    await page.waitForTimeout(700)
    await page.screenshot({ path: `${OUT}hm_${w}_${String(p).replace('.', '')}.png` })
  }
}
await b.close()
