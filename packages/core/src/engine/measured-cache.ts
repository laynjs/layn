import type { ItemId, LayoutItem, Size } from '../types/index.js'
import type { MeasuredCache } from './types.js'

const sizeChanged = (previous: Size | undefined, next: Size): boolean =>
  previous === undefined || previous.width !== next.width || previous.height !== next.height

export const createMeasuredCache = (
  initial?: ReadonlyArray<readonly [ItemId, Size]>,
): MeasuredCache => {
  const sizes = new Map<ItemId, Size>(initial)

  return {
    get: (id) => sizes.get(id),
    record(entries) {
      let changed = false
      for (const entry of entries) {
        if (sizeChanged(sizes.get(entry.id), entry.size)) {
          sizes.set(entry.id, entry.size)
          changed = true
        }
      }
      return changed
    },
    prune(items: readonly LayoutItem[]) {
      if (sizes.size === 0) {
        return
      }
      const live = new Set<ItemId>()
      for (const item of items) {
        live.add(item.id)
      }
      for (const id of sizes.keys()) {
        if (!live.has(id)) {
          sizes.delete(id)
        }
      }
    },
    entries: () => [...sizes.entries()],
  }
}
