import type { ItemAria } from '@laynjs/adapter-utils'
import type { ItemId, LayoutItem, Rect } from '@laynjs/core'

export interface LaynItem<TData = unknown> {
  readonly id: ItemId
  readonly index: number
  readonly item: LayoutItem<TData>
  readonly rect: Rect
  readonly style: Record<string, string>
  readonly a11y: ItemAria
}

export interface ItemActionParams {
  readonly id: ItemId
  readonly rect: Rect
}
