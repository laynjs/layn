/**
 * Options for `justified`: rows filled greedily, then scaled so each full row spans the container
 * exactly. Aspect ratios are preserved; heights vary row to row. The trailing row is not stretched.
 */
export interface JustifiedOptions {
  /** The height rows aim for before being scaled to fit. */
  readonly targetRowHeight?: number
  /** Ceiling applied after scaling, so a sparse row cannot balloon. */
  readonly maxRowHeight?: number
}
