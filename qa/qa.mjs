// QA pass: breakpoints, overflow, console, navigation, keyboard, reduced motion, performance.
// Usage: node qa/qa.mjs [sweep|nav|reduced|perf]   (dev server on :5173)
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const SITE = process.env.SITE ?? 'http://localhost:5173/'
const OUT = new URL('./shots/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })
const mode = process.argv[2] ?? 'sweep'

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-gpu', '--ignore-gpu-blocklist'] })

async function open(width, height, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, ...opts })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(`${m.type()}: ${m.text()}`))
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  await page.goto(SITE)
  await page.waitForFunction(() => !document.body.classList.contains('is-loading'), null, { timeout: 30000 })
  await page.waitForTimeout(1600)
  return { ctx, page, errors }
}

/** Scroll to a fraction of a section's sticky track (or its top when not sticky). */
async function goto(page, id, p = 0) {
  await page.evaluate(
    ([id, p]) => {
      const e = document.getElementById(id)
      const top = e.getBoundingClientRect().top + scrollY
      scrollTo(0, top + Math.max(0, e.offsetHeight - innerHeight) * p)
    },
    [id, p],
  )
  await page.waitForTimeout(900)
}

const overflow = (page) =>
  page.evaluate(() => {
    const w = document.documentElement.clientWidth
    const offenders = [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        return r.width > 0 && (r.right > w + 1 || r.left < -1) && cs.position !== 'fixed' && !el.closest('.world__sticky, .hero__sticky, .experience__sticky')
      })
      .slice(0, 5)
      .map((el) => el.className || el.tagName)
    return { scrollWidth: document.documentElement.scrollWidth, clientWidth: w, offenders }
  })

if (mode === 'sweep') {
  const sizes = [[1920, 1080], [1440, 900], [1280, 800], [1024, 768], [768, 1024], [390, 844], [360, 740]]
  const stops = [
    ['home', 0], ['home', 0.5], ['the-world', 0.1], ['the-world', 0.8],
    ['experience', 0.1], ['experience', 0.45], ['experience', 0.65], ['get-the-game', 0],
  ]
  for (const [w, h] of sizes) {
    const { ctx, page, errors } = await open(w, h)
    const ov = await overflow(page)
    for (const [id, p] of stops) {
      await goto(page, id, p)
      if (id === 'get-the-game') await page.waitForTimeout(1200)
      await page.screenshot({ path: `${OUT}${w}_${id}_${String(p).replace('.', '')}.png` })
    }
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(600)
    await page.screenshot({ path: `${OUT}${w}_footer.png` })
    console.log(JSON.stringify({ w, h, overflowX: ov.scrollWidth > ov.clientWidth, ...ov, errors }))
    await ctx.close()
  }
}

if (mode === 'nav') {
  const { ctx, page, errors } = await open(1440, 900)
  const results = []
  for (const label of ['The World', 'Experience', 'Get the Game', 'Home']) {
    await page.locator('header').getByRole('link', { name: label, exact: true }).first().click()
    await page.waitForTimeout(2500)
    results.push(
      await page.evaluate((label) => {
        const id = { 'The World': 'the-world', Experience: 'experience', 'Get the Game': 'get-the-game', Home: 'home' }[label]
        const top = document.getElementById(id).getBoundingClientRect().top
        return { label, sectionTopAfterScroll: Math.round(top), focused: document.activeElement?.id }
      }, label),
    )
    if (label !== 'Home') await page.evaluate(() => scrollTo(0, 0)), await page.waitForTimeout(400)
  }
  // Keyboard: first tab stops
  await page.evaluate(() => scrollTo(0, 0))
  await page.keyboard.press('Tab')
  const tabs = []
  for (let i = 0; i < 9; i++) {
    tabs.push(
      await page.evaluate(() => {
        const a = document.activeElement
        return `${a.tagName.toLowerCase()}:${(a.getAttribute('aria-label') || a.textContent || a.getAttribute('alt') || '').trim().slice(0, 28)}`
      }),
    )
    await page.keyboard.press('Tab')
  }
  // Mobile menu
  const m = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mp = await m.newPage()
  await mp.goto(SITE)
  await mp.waitForFunction(() => !document.body.classList.contains('is-loading'))
  await mp.getByRole('button', { name: 'Open menu' }).click()
  await mp.waitForTimeout(300)
  await mp.screenshot({ path: `${OUT}390_menu.png` })
  await mp.keyboard.press('Escape')
  const menuClosed = await mp.evaluate(() => document.getElementById('mobile-menu').hidden)
  console.log(JSON.stringify({ results, tabs, menuClosedOnEscape: menuClosed, errors }, null, 1))
  await ctx.close()
  await m.close()
}

if (mode === 'reduced') {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { ctx, page, errors } = await open(w, h, { reducedMotion: 'reduce' })
    const state = await page.evaluate(() => ({
      heroVideo: !!document.querySelector('.hero__video'),
      heroStill: !!document.querySelector('.hero__still'),
      heroH: document.getElementById('home').offsetHeight,
      worldStatic: document.getElementById('the-world').classList.contains('world--static'),
      experienceStatic: document.getElementById('experience').classList.contains('experience--static'),
      pageH: document.body.scrollHeight,
      hiddenCopy: [...document.querySelectorAll('h1,h2,h3,p')].filter((e) => getComputedStyle(e).visibility === 'hidden' || +getComputedStyle(e).opacity === 0).length,
    }))
    await page.screenshot({ path: `${OUT}reduced_${w}_hero.png` })
    await goto(page, 'the-world', 0)
    await page.screenshot({ path: `${OUT}reduced_${w}_world.png` })
    await goto(page, 'experience', 0)
    await page.screenshot({ path: `${OUT}reduced_${w}_experience.png` })
    await goto(page, 'get-the-game', 0)
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `${OUT}reduced_${w}_buy.png` })
    console.log(JSON.stringify({ w, ...state, errors }))
    await ctx.close()
  }
}

if (mode === 'perf') {
  const { ctx, page, errors } = await open(1440, 900)
  // Record rAF frame times per section while scrolling with the wheel, both directions.
  await page.evaluate(() => {
    window.__frames = []
    let last = performance.now()
    const tick = (t) => {
      const sec = ['home', 'the-world', 'experience', 'get-the-game'].find((id) => {
        const r = document.getElementById(id).getBoundingClientRect()
        return r.top <= 1 && r.bottom > 1
      }) ?? 'other'
      window.__frames.push([t - last, sec])
      last = t
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  await page.mouse.move(720, 450)
  const total = await page.evaluate(() => document.body.scrollHeight - innerHeight)
  const step = 120
  for (let y = 0; y < total; y += step) {
    await page.mouse.wheel(0, step)
    await page.waitForTimeout(16)
  }
  await page.waitForTimeout(500)
  for (let y = total; y > 0; y -= step * 2) {
    await page.mouse.wheel(0, -step * 2)
    await page.waitForTimeout(16)
  }
  const stats = await page.evaluate(() => {
    const by = {}
    for (const [dt, s] of window.__frames.slice(5)) (by[s] ??= []).push(dt)
    const out = {}
    for (const [s, arr] of Object.entries(by)) {
      arr.sort((a, b) => a - b)
      const q = (x) => arr[Math.min(arr.length - 1, Math.floor(arr.length * x))].toFixed(1)
      out[s] = { frames: arr.length, median: q(0.5), p95: q(0.95), max: arr.at(-1).toFixed(1), over33ms: arr.filter((d) => d > 33.4).length }
    }
    return out
  })
  console.log(JSON.stringify({ stats, errors }, null, 1))
  await ctx.close()
}

await browser.close()
