import type { TrackCount } from './responsive.js'

/**
 * Options for `columns`: fixed columns filled round-robin, so reading order is preserved. Use this
 * rather than `masonry` when item order has to be obvious to the eye.
 */
export interface ColumnsOptions {
  /** A fixed column count, or a breakpoint map read against the container. */
  readonly columns?: TrackCount
  /** Target column width in pixels; the count is derived from the container. */
  readonly columnWidth?: number
  /** Upper bound when the count comes from `columnWidth`. */
  readonly maxColumns?: number
}
