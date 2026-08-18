import type { TrackCount } from './responsive.js'

/** One cell of a quilt pattern: how many columns and rows it covers. */
export type QuiltSpan = readonly [number, number]

/**
 * Options for `quilt`: a grid of discrete cells filled by a repeating pattern of interlocking
 * blocks. The one algorithm that honours `LayoutItem.span`, and the only one that can place hero
 * tiles with no gaps at all, because its cells are uniform.
 */
export interface QuiltOptions {
  /** A fixed column count, or a breakpoint map read against the container. */
  readonly columns?: TrackCount
  /** Target column width in pixels; the count is derived from the container. */
  readonly columnWidth?: number
  /** Upper bound when the count comes from `columnWidth`. */
  readonly maxColumns?: number
  /** The repeating block pattern. Items declaring their own `span` override it. */
  readonly pattern?: readonly QuiltSpan[]
}
