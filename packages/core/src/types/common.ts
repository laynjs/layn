/** Identity of a single item. Must be stable across renders. */
export type ItemId = string | number

/**
 * Reading direction. `rtl` mirrors the layout inside the engine rather than in CSS, so hit testing,
 * `scrollToItem` and drag and drop all agree with what is on screen.
 */
export type Direction = 'ltr' | 'rtl'

/** A width and a height in pixels. */
export interface Size {
  readonly width: number
  readonly height: number
}

/** An item's position and size in pixels, relative to the content box. */
export interface Rect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/** Space between items, in pixels. Use this rather than margins, which the engine cannot see. */
export interface Gap {
  readonly x: number
  readonly y: number
}

/** The box the layout is computed into: your scroll container's content box. */
export interface Viewport {
  readonly width: number
  readonly height: number
}
