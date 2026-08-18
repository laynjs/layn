import type { LayoutEngine, ScrollAxis } from '@laynjs/core'
import type { DomEnvironment } from './environment.js'
import type { ScrollTarget } from './target.js'

/** Options for `createDevtools`. */
export interface DevtoolsOptions {
  readonly engine: LayoutEngine
  /** The scroll container. The overlay is drawn over its bounding box. */
  readonly container: HTMLElement
  readonly scroll?: ScrollTarget
  readonly axis?: ScrollAxis
  readonly overscan?: number
  readonly environment?: Partial<DomEnvironment>
}

/**
 * The overlay controller. Draws the engine's own rectangles over your grid: green where the size
 * came from a real measurement, amber where it still comes from your data, dashed lines for the
 * overscan band, plus a readout of item, rendered and measured counts.
 *
 * It is a fixed-position canvas appended to the body, not a child of your content, because content
 * routinely exceeds the maximum canvas height a browser will allocate.
 */
export interface Devtools {
  show(): void
  hide(): void
  toggle(): boolean
  refresh(): void
  destroy(): void
}

/** One frame of overlay state, as handed to the painter. */
export interface DevtoolsFrame {
  readonly total: number
  readonly rendered: number
  readonly measured: number
  readonly start: number
  readonly size: number
  readonly overscan: number
  readonly axis: ScrollAxis
  readonly contentWidth: number
  readonly contentHeight: number
}
