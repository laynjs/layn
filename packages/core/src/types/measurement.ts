import type { ItemId, Size } from './common.js'
import type { LayoutItem } from './item.js'

export interface Measurements {
  size(item: LayoutItem, targetWidth: number): Size
  aspectRatio(item: LayoutItem): number
}

export interface MeasurementCache {
  get(id: ItemId): Size | undefined
}

export interface MeasurementsOptions {
  readonly cache?: MeasurementCache
  readonly defaultAspectRatio?: number
  readonly estimateHeight?: (item: LayoutItem, targetWidth: number) => number
}

export interface MeasuredEntry {
  readonly id: ItemId
  readonly size: Size
}
