import type { TrackCount } from './responsive.js'

/**
 * Options for `horizontalMasonry`: the transpose of masonry. Fixed-height rows, each item placed in
 * the shortest one, content growing to the right. Pair it with `axis: 'horizontal'` on the adapter.
 *
 * This is the one algorithm `direction: 'rtl'` does not mirror, since the content has no fixed
 * width to mirror against; reverse the scroller with CSS `direction: rtl` instead.
 */
export interface HorizontalMasonryOptions {
  /** A fixed row count, or a breakpoint map read against the container height. */
  readonly rows?: TrackCount
  /** Target row height in pixels; the count is derived from the container. */
  readonly rowHeight?: number
  /** Upper bound when the count comes from `rowHeight`. */
  readonly maxRows?: number
}
