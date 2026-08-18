/**
 * Options for `packing`: a bottom-left skyline packer. Tight, linear, and leaves a ragged right
 * edge. The O(n) alternative to `binPacking`.
 */
export interface PackingOptions {
  /** Nominal tile size in pixels; item widths are derived from it and their aspect ratio. */
  readonly baseSize?: number
}
