import { chromium } from 'playwright-core'
const SITE = process.env.SITE ?? 'http://localhost:5173/'
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-gpu'] })
for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true], [390, 664, true]]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile })).newPage()
  await page.goto(SITE)
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'))
  await page.waitForTimeout(3000)
  const read = () => page.evaluate(() => ({
    y: Math.round(scrollY),
    frame: document.querySelector('.hero__video canvas')?.dataset.frame,
    text: (+getComputedStyle(document.querySelector('.hero__content')).opacity).toFixed(2),
    glide: document.getElementById('home').style.getPropertyValue('--hero-glide'),
  }))
  const top = await read()
  // A layout viewport shorter than innerHeight (iOS floating toolbars): shrink the sticky.
  await page.addStyleTag({ content: '.hero__sticky{height:calc(100svh - 120px)!important}' })
  await page.evaluate(() => window.dispatchEvent(new Event('resize')))
  await page.waitForTimeout(800)
  const mismatch = await read()
  await page.evaluate(() => scrollTo(0, (document.getElementById('home').offsetHeight - document.querySelector('.hero__sticky').offsetHeight) * 0.5))
  await page.waitForTimeout(900)
  console.log(JSON.stringify({ w, h, top, withShorterSticky: mismatch, mid: await read() }))
}
await b.close()
