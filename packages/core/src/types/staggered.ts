import type { TrackCount } from './responsive.js'

/** Options for `staggered`: round-robin columns with every other column offset downwards. */
export interface StaggeredOptions {
  /** A fixed column count, or a breakpoint map read against the container. */
  readonly columns?: TrackCount
  /** Target column width in pixels; the count is derived from the container. */
  readonly columnWidth?: number
  /** Upper bound when the count comes from `columnWidth`. */
  readonly maxColumns?: number
  /** Vertical offset on odd columns, as a fraction of the column width. */
  readonly stagger?: number
}
