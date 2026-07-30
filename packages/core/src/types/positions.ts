import type { ItemId, Rect } from './common.js'

export interface Positions {
  readonly count: number
  readonly x: Float64Array
  readonly y: Float64Array
  readonly width: Float64Array
  readonly height: Float64Array
  idAt(index: number): ItemId
  indexOf(id: ItemId): number
  rectAt(index: number): Rect
  rectOf(id: ItemId): Rect | undefined
}

export interface SerializedPositions {
  readonly ids: readonly ItemId[]
  readonly x: readonly number[]
  readonly y: readonly number[]
  readonly width: readonly number[]
  readonly height: readonly number[]
}
