import { itemAria, mapVisible, rectStyleObject } from '@laynjs/adapter-utils'
import type { EngineSnapshot, LayoutItem } from '@laynjs/core'
import type { LaynItem } from '../types/index.js'

export const buildItems = <TData>(
  items: readonly LayoutItem<TData>[],
  snapshot: EngineSnapshot,
  visible: readonly number[],
): LaynItem<TData>[] =>
  mapVisible(items, snapshot, visible, (item, index, rect) => ({
    id: item.id,
    index,
    item,
    rect,
    style: rectStyleObject(rect),
    a11y: itemAria(index, items.length),
  }))
