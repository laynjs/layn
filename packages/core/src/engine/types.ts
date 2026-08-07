import type {
  ItemId,
  LayoutItem,
  MeasuredEntry,
  Positions,
  ScrollAxis,
  Size,
  SpatialIndex,
} from '../types/index.js'

export interface IndexCache {
  readonly positions: Positions
  readonly axis: ScrollAxis
  readonly bandSize: number
  readonly index: SpatialIndex
}

export interface MeasuredCache {
  get(id: ItemId): Size | undefined
  record(entries: readonly MeasuredEntry[]): boolean
  prune(items: readonly LayoutItem[]): void
  entries(): ReadonlyArray<readonly [ItemId, Size]>
}
