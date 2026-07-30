import { itemAria, mapVisible, rectStyleObject } from '@laynjs/adapter-utils'
import type { EngineSnapshot, ItemId, LayoutItem } from '@laynjs/core'
import type { LaynElementRef, LaynItem } from '../types/index.js'

export const buildItems = <TData>(
  items: readonly LayoutItem<TData>[],
  snapshot: EngineSnapshot,
  visible: readonly number[],
  refFor: (id: ItemId) => LaynElementRef,
): LaynItem<TData>[] =>
  mapVisible(items, snapshot, visible, (item, index, rect) => ({
    id: item.id,
    index,
    item,
    style: rectStyleObject(rect),
    a11y: itemAria(index, items.length),
    ref: refFor(item.id),
  }))
