export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** Progress of `v` inside [a, b], clamped to 0–1. */
export const range = (v: number, [a, b]: readonly [number, number]) => clamp((v - a) / (b - a))
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeIn = (t: number) => t * t * t
/** Piecewise-linear map through sorted [x, y] keys. */
export const piecewise = (x: number, keys: [number, number][]) => {
  if (x <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) {
    const [x1, y1] = keys[i]
    const [x0, y0] = keys[i - 1]
    if (x <= x1) return lerp(y0, y1, (x - x0) / (x1 - x0))
  }
  return keys[keys.length - 1][1]
}
