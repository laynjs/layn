import type { ItemId } from './common.js'

export interface LayoutItem<TData = unknown> {
  readonly id: ItemId
  readonly width?: number
  readonly height?: number
  readonly aspectRatio?: number
  readonly span?: number
  readonly data?: TData
}
