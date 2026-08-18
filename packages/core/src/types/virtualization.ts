/** Which axis the container scrolls along. */
export type ScrollAxis = 'vertical' | 'horizontal'

/** A slice of the scroll axis: where the viewport starts, and how long it is. */
export interface ScrollWindow {
  readonly start: number
  readonly size: number
}

export interface SpatialIndexOptions {
  readonly axis?: ScrollAxis
  /** Bucket size along the axis. Larger bands mean a smaller index and coarser queries. */
  readonly bandSize?: number
}

export interface SpatialIndex {
  query(window: ScrollWindow, overscan?: number): readonly number[]
}

export interface VisibleOptions {
  readonly axis?: ScrollAxis
  /** Pixels to render beyond each edge of the viewport, trading memory for fewer blank frames. */
  readonly overscan?: number
  readonly bandSize?: number
}
