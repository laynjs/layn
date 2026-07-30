export type ScrollAxis = 'vertical' | 'horizontal'

export interface ScrollWindow {
  readonly start: number
  readonly size: number
}

export interface SpatialIndexOptions {
  readonly axis?: ScrollAxis
  readonly bandSize?: number
}

export interface SpatialIndex {
  query(window: ScrollWindow, overscan?: number): readonly number[]
}

export interface VisibleOptions {
  readonly axis?: ScrollAxis
  readonly overscan?: number
  readonly bandSize?: number
}
