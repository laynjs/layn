/**
 * Options for `binPacking`: a maximal-rectangles packer that backfills earlier holes with later
 * items. Visibly tighter than `packing` and by far the most expensive algorithm here, since it
 * costs O(n * cap^2) rather than O(n). Reach for `packing` at large item counts.
 */
export interface BinPackingOptions {
  /** Nominal tile size in pixels; item widths are derived from it and their aspect ratio. */
  readonly baseSize?: number
}
