import type { ItemAria } from '@laynjs/adapter-utils'
import type { ItemId, LayoutItem } from '@laynjs/core'
import type { CSSProperties } from 'react'

export interface LaynItem<TData = unknown> {
  readonly id: ItemId
  readonly index: number
  readonly item: LayoutItem<TData>
  readonly style: CSSProperties
  readonly a11y: ItemAria
  readonly ref: (element: HTMLElement | null) => void
}
