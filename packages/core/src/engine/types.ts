import type { Positions, ScrollAxis, SpatialIndex } from '../types/index.js'

export interface IndexCache {
  readonly positions: Positions
  readonly axis: ScrollAxis
  readonly bandSize: number
  readonly index: SpatialIndex
}
