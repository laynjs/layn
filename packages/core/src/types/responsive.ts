/**
 * A map of minimum **container** width to track count. Keys may be in any order, apply at their
 * exact width, and below the smallest key the smallest entry wins.
 *
 * ```ts
 * masonry({ columns: { 0: 1, 640: 2, 1000: 3, 1400: 4 } });
 * ```
 *
 * These are container widths, not viewport widths, so the same grid adapts inside a sidebar or a
 * modal without a media query.
 */
export type Breakpoints = Readonly<Record<number, number>>

/** A fixed track count, or a breakpoint map read against the container. */
export type TrackCount = number | Breakpoints

/** Column sizing, shared by every column-based algorithm. */
export interface ColumnCountOptions {
  /** A fixed count, or a breakpoint map. Takes precedence over `columnWidth`. */
  readonly columns?: TrackCount
  /** Target column width in pixels; the count is derived from the container. */
  readonly columnWidth?: number
  /** Upper bound when the count is derived from `columnWidth`. */
  readonly maxColumns?: number
}

/** Row sizing, for algorithms that flow along the horizontal axis. */
export interface RowCountOptions {
  readonly rows?: TrackCount
  readonly rowHeight?: number
  readonly maxRows?: number
}
