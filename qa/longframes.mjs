import { chromium } from 'playwright-core'
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-gpu', '--ignore-gpu-blocklist'] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await page.goto('http://localhost:5173/')
await page.waitForFunction(() => !document.body.classList.contains('is-loading'))
await page.waitForTimeout(2500)
await page.evaluate(() => {
  window.__long = []; let last = performance.now(); let dir = 'down'; let lastY = 0
  const tick = (t) => {
    if (scrollY !== lastY) dir = scrollY > lastY ? 'down' : 'up'
    lastY = scrollY
    if (t - last > 30) {
      const sec = ['home','the-world','experience','get-the-game'].find(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.top <= 1 && r.bottom > 1 }) ?? 'footer/other'
      window.__long.push({ dt: Math.round(t - last), y: Math.round(scrollY), sec, dir, stage: document.querySelector('.product-stage')?.className })
    }
    last = t; requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})
await page.mouse.move(720, 450)
const total = await page.evaluate(() => document.body.scrollHeight - innerHeight)
for (let y = 0; y < total; y += 120) { await page.mouse.wheel(0, 120); await page.waitForTimeout(16) }
await page.waitForTimeout(500)
for (let y = total; y > 0; y -= 240) { await page.mouse.wheel(0, -240); await page.waitForTimeout(16) }
console.log(JSON.stringify(await page.evaluate(() => window.__long), null, 0), 'total', total)
await b.close()
