/**
 * Image-sequence store for scroll scrubbing (Strategy B).
 *
 * Why not <video>: mobile browsers (iOS Safari especially) decode on every
 * seek and often show nothing until the seek lands, so fast scrubbing
 * flickers to black. Pre-decoded frames drawn to a canvas never do.
 *
 * Loading is progressive: a coarse pass (every Nth frame across the whole
 * clip) makes the hero usable early; the fine pass fills the gaps. Drawing
 * always uses the nearest frame already loaded.
 */
export type Frame = ImageBitmap | HTMLImageElement

export class FrameSequence {
  readonly frames: (Frame | null)[]
  /** Indices (into the source clip) this device loads, e.g. every 2nd on phones. */
  readonly indices: number[]
  private ctrl = new AbortController()
  private listeners = new Set<() => void>()

  readonly sourceCount: number
  readonly url: (i: number) => string
  readonly step: number

  constructor(sourceCount: number, url: (i: number) => string, step = 1) {
    this.sourceCount = sourceCount
    this.url = url
    this.step = step
    this.indices = []
    for (let i = 0; i < sourceCount; i += step) this.indices.push(i)
    if (this.indices[this.indices.length - 1] !== sourceCount - 1) this.indices.push(sourceCount - 1)
    this.frames = new Array(sourceCount).fill(null)
  }

  onFrame(cb: () => void) {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  /** Nearest loaded frame to a (fractional) source index. */
  nearest(i: number): { frame: Frame; index: number } | null {
    const n = this.sourceCount
    const c = Math.max(0, Math.min(n - 1, Math.round(i)))
    for (let d = 0; d < n; d++) {
      const a = this.frames[c - d]
      if (a) return { frame: a, index: c - d }
      const b = this.frames[c + d]
      if (b) return { frame: b, index: c + d }
    }
    return null
  }

  private async fetchFrame(i: number) {
    const signal = this.ctrl.signal
    let frame: Frame
    if ('createImageBitmap' in window) {
      const res = await fetch(this.url(i), { signal })
      const blob = await res.blob()
      frame = await createImageBitmap(blob)
    } else {
      const img = new Image()
      img.src = this.url(i)
      await img.decode()
      frame = img
    }
    if (signal.aborted) return
    this.frames[i] = frame
    this.listeners.forEach((l) => l())
  }

  /**
   * Coarse pass first, then fine. `onCoarse(progress)` reports real
   * progress of the coarse pass; it resolves once every coarse frame is in.
   */
  async load(coarseEvery: number, onCoarse: (p: number) => void, concurrency = 6) {
    const coarse = this.indices.filter((_, k) => k % coarseEvery === 0 || k === this.indices.length - 1)
    const fine = this.indices.filter((i) => !coarse.includes(i))
    let done = 0
    const run = async (queue: number[], onEach?: () => void) => {
      const q = [...queue]
      const worker = async () => {
        while (q.length && !this.ctrl.signal.aborted) {
          const i = q.shift()!
          try {
            await this.fetchFrame(i)
          } catch {
            /* skip a failed frame; neighbours cover it */
          }
          onEach?.()
        }
      }
      await Promise.all(Array.from({ length: concurrency }, worker))
    }
    onCoarse(0)
    await run(coarse, () => onCoarse(++done / coarse.length))
    // Fill in without blocking the caller.
    void run(fine)
  }

  dispose() {
    this.ctrl.abort()
    this.frames.forEach((f) => f && 'close' in f && f.close())
    this.listeners.clear()
  }
}
