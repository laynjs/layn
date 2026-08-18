import type { TrackCount } from './responsive.js'

/** Options for `masonry`: columns of equal width, each item placed in the shortest one. */
export interface MasonryOptions {
  /** A fixed column count, or a breakpoint map read against the container. */
  readonly columns?: TrackCount
  /** Target column width in pixels; the count is derived from the container. */
  readonly columnWidth?: number
  /** Upper bound when the count comes from `columnWidth`. */
  readonly maxColumns?: number
}
