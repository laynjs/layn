import type { ItemId, PositionsBuilder } from '../types/index.js'

export interface PositionData {
  ids: ItemId[]
  xs: Float64Array
  ys: Float64Array
  ws: Float64Array
  hs: Float64Array
  count: number
  capacity: number
  mirror: number | undefined
}

export interface PositionsSink extends PositionsBuilder {
  readonly data: PositionData
}
