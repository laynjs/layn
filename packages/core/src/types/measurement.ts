import type { ItemId, Size } from './common.js'
import type { LayoutItem } from './item.js'

/**
 * How an item's size is resolved. The order is: a real DOM measurement, then explicit
 * `width`/`height`, then `aspectRatio`, then the estimator, then a default. Data comes before the
 * DOM on purpose, so a server with no DOM reaches the same answer the browser will.
 */
export interface Measurements {
  size(item: LayoutItem, targetWidth: number): Size
  aspectRatio(item: LayoutItem): number
}

export interface MeasurementCache {
  get(id: ItemId): Size | undefined
}

export interface MeasurementsOptions {
  readonly cache?: MeasurementCache
  /** Used when an item declares no shape at all. */
  readonly defaultAspectRatio?: number
  /** Last resort before the default, for content whose height you can guess from your own data. */
  readonly estimateHeight?: (item: LayoutItem, targetWidth: number) => number
}

/** One measured size, as fed back by `engine.measure`. */
export interface MeasuredEntry {
  readonly id: ItemId
  readonly size: Size
}
