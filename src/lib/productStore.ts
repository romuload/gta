/**
 * Shared, non-React state for the single 3D product. Written by scroll
 * triggers and pointer handlers, read every frame by the WebGL stage.
 * Avoids React re-renders on scroll.
 */
export const productStore = {
  /** Section 03 scroll progress, 0–1. */
  p: 0,
  /** Section 04 hand-off progress, 0–1. */
  h: 0,
  /** DOM element the model settles into in Section 04. */
  anchor: null as HTMLElement | null,
  /** True when motion is reduced: the model rests in the showcase only. */
  reduced: false,
  drag: {
    active: false,
    /** Manual offsets (radians) added on top of the scroll pose. */
    x: 0,
    y: 0,
    /** Weight of the frozen scroll pose while the user is interacting. */
    hold: 0,
  },
}

if (import.meta.env.DEV) (window as unknown as { __product: typeof productStore }).__product = productStore
