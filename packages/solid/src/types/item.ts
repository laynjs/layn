import type { ItemAria } from '@laynjs/adapter-utils'
import type { EngineSnapshot, ItemId, LayoutItem, Rect } from '@laynjs/core'
import type { JSX } from 'solid-js'

export type LaynElementRef = (element: Element) => void

export type MakeRef = (id: ItemId, rect: Rect) => LaynElementRef

export interface LaynItem<TData = unknown> {
  readonly id: ItemId
  readonly index: number
  readonly item: LayoutItem<TData>
  readonly style: JSX.CSSProperties
  readonly a11y: ItemAria
  readonly ref: LaynElementRef
}

export type ItemBuilder<TData = unknown> = (
  items: readonly LayoutItem<TData>[],
  snapshot: EngineSnapshot,
  visible: readonly number[],
) => LaynItem<TData>[]
