import type { ItemId, Rect } from './common.js'

/**
 * The layout result, stored as parallel `Float64Array`s rather than an object per item. That
 * storage choice is what makes large layouts fast, so prefer reading the arrays directly in hot
 * paths; `rectAt` and `rectOf` allocate.
 *
 * Indices match the item array position for position.
 */
export interface Positions {
  readonly count: number
  readonly x: Float64Array
  readonly y: Float64Array
  readonly width: Float64Array
  readonly height: Float64Array
  idAt(index: number): ItemId
  /** Reverse lookup. Builds a lazy id map on first use, so prefer indices where you have them. */
  indexOf(id: ItemId): number
  rectAt(index: number): Rect
  rectOf(id: ItemId): Rect | undefined
}

/**
 * Write side of `Positions`, for algorithms. Get one from `createPositionsBuilder(capacity, mirror)`
 * and push items in order; `mirror` is the extent to mirror against for right-to-left layouts.
 */
export interface PositionsBuilder {
  push(id: ItemId, x: number, y: number, width: number, height: number): void
  build(): Positions
}

export interface SerializedPositions {
  readonly ids: readonly ItemId[]
  readonly x: readonly number[]
  readonly y: readonly number[]
  readonly width: readonly number[]
  readonly height: readonly number[]
}
