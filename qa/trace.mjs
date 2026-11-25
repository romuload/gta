import { chromium } from 'playwright-core'
import { readFileSync } from 'node:fs'
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-gpu', '--ignore-gpu-blocklist'] })
const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await page.goto('http://localhost:5173/')
await page.waitForFunction(() => !document.body.classList.contains('is-loading'))
await page.waitForTimeout(2500)
await page.mouse.move(720, 450)
const total = await page.evaluate(() => document.body.scrollHeight - innerHeight)
await b.startTracing(page, { path: 'qa/trace.json', categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'v8.execute', 'blink'] })
for (let y = 0; y < total; y += 120) { await page.mouse.wheel(0, 120); await page.waitForTimeout(16) }
await page.waitForTimeout(600)
await b.stopTracing()
const ev = JSON.parse(readFileSync('qa/trace.json')).traceEvents
const long = ev.filter(e => e.ph === 'X' && e.dur > 40000 && ['RunTask','FunctionCall','EvaluateScript','Layout','UpdateLayoutTree','Paint','DecodeImage','ImageDecodeTask','GPUTask','MajorGC','MinorGC','V8.GC_SCAVENGER','FireAnimationFrame','v8.compile','HitTest','RasterTask','ParseHTML','TimerFire'].includes(e.name))
const byTs = long.sort((a,b)=>a.ts-b.ts)
// for each long RunTask, list its biggest children
for (const t of byTs.filter(e => e.name === 'RunTask')) {
  const kids = ev.filter(e => e.ph === 'X' && e.tid === t.tid && e.ts >= t.ts && e.ts + (e.dur||0) <= t.ts + t.dur && e !== t && e.dur > 8000)
    .sort((a,b)=>b.dur-a.dur).slice(0,6).map(e => `${e.name}${e.args?.data?.url ? '('+e.args.data.url.split('/').pop()+')' : ''}${e.args?.data?.functionName ? '['+e.args.data.functionName+']' : ''}:${Math.round(e.dur/1000)}ms`)
  console.log(`RunTask ${Math.round(t.dur/1000)}ms tid=${t.tid}`, kids.join(' | '))
}
console.log('other long:', byTs.filter(e=>e.name!=='RunTask').map(e=>`${e.name}:${Math.round(e.dur/1000)}`).join(', '))
await b.close()
