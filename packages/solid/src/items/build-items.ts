import { itemAria, mapVisible, rectStyleObject } from '@laynjs/adapter-utils'
import type { ItemId } from '@laynjs/core'
import type { ItemBuilder, LaynItem, MakeRef } from '../types/index.js'

export const createItemBuilder = <TData>(makeRef: MakeRef): ItemBuilder<TData> => {
  const cache = new Map<ItemId, { key: string; value: LaynItem<TData> }>()
  return (items, snapshot, visible) => {
    const seen = new Set<ItemId>()
    const built = mapVisible(items, snapshot, visible, (item, index, rect) => {
      seen.add(item.id)
      const key = `${rect.x}|${rect.y}|${rect.width}|${rect.height}`
      const cached = cache.get(item.id)
      if (cached !== undefined && cached.key === key && cached.value.item === item) {
        return cached.value
      }
      const value: LaynItem<TData> = {
        id: item.id,
        index,
        item,
        style: rectStyleObject(rect),
        a11y: itemAria(index, items.length),
        ref: makeRef(item.id, rect),
      }
      cache.set(item.id, { key, value })
      return value
    })
    for (const id of [...cache.keys()]) {
      if (!seen.has(id)) {
        cache.delete(id)
      }
    }
    return built
  }
}
