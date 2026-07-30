import type { ItemAria } from '@laynjs/adapter-utils'
import type { ItemId, LayoutItem } from '@laynjs/core'
import type { ComponentPublicInstance } from 'vue'

export type LaynElementRef = (element: Element | ComponentPublicInstance | null) => void

export interface LaynItem<TData = unknown> {
  readonly id: ItemId
  readonly index: number
  readonly item: LayoutItem<TData>
  readonly style: Record<string, string>
  readonly a11y: ItemAria
  readonly ref: LaynElementRef
}
