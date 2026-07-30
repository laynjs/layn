import { itemAria, mapVisible } from '@laynjs/adapter-utils'
import type { EngineSnapshot, ItemId, LayoutItem, Rect } from '@laynjs/core'
import type { CSSProperties } from 'react'
import type { LaynItem } from '../types/index.js'

const styleOf = (rect: Rect): CSSProperties => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: rect.width,
  height: rect.height,
  transform: `translate(${rect.x}px, ${rect.y}px)`,
})

export const buildItems = <TData>(
  items: readonly LayoutItem<TData>[],
  snapshot: EngineSnapshot,
  visible: readonly number[],
  refFor: (id: ItemId) => (element: HTMLElement | null) => void,
): LaynItem<TData>[] =>
  mapVisible(items, snapshot, visible, (item, index, rect) => ({
    id: item.id,
    index,
    item,
    style: styleOf(rect),
    a11y: itemAria(index, items.length),
    ref: refFor(item.id),
  }))
