import type { ItemId, LayoutEngine, LayoutItem } from '@laynjs/core'
import type { StickyHeaders } from '../types/index.js'
import { createStickyHeaders } from './sticky-headers.js'

export const stickyFor = (
  engine: LayoutEngine,
  elementOf: (id: ItemId) => Element | undefined,
  isHeader: ((item: LayoutItem) => boolean) | undefined,
): StickyHeaders | undefined => {
  if (isHeader === undefined) {
    return undefined
  }
  return createStickyHeaders({
    engine,
    isHeader,
    elementOf: (index) => {
      const positions = engine.getSnapshot().positions
      if (index < 0 || index >= positions.count) {
        return undefined
      }
      return elementOf(positions.idAt(index)) as HTMLElement | undefined
    },
  })
}

export const withPinned = (
  indices: readonly number[],
  sticky: StickyHeaders | undefined,
  start: number,
): readonly number[] => {
  if (sticky === undefined) {
    return indices
  }
  sticky.update(start)
  const held = sticky.pinnedIndex()
  return held === undefined || indices.includes(held) ? indices : [...indices, held]
}
