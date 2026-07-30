import type { ItemId, Positions } from '../types/index.js'

export interface PositionData {
  ids: ItemId[]
  xs: Float64Array
  ys: Float64Array
  ws: Float64Array
  hs: Float64Array
  count: number
  capacity: number
}

export interface PositionsBuilder {
  readonly data: PositionData
  push(id: ItemId, x: number, y: number, width: number, height: number): void
  build(): Positions
}
