import { chromium } from 'playwright-core'
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-gpu', '--ignore-gpu-blocklist'] })
const p = await b.newPage()
await p.goto('http://localhost:5173/')
const info = await p.evaluate(() => {
  const gl = document.createElement('canvas').getContext('webgl2')
  const ext = gl.getExtension('WEBGL_debug_renderer_info')
  return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
})
console.log('renderer:', info)
await b.close()
