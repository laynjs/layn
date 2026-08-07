import type { Positions } from '@laynjs/core'

export const indexAtPoint = (
  positions: Positions,
  visible: readonly number[],
  x: number,
  y: number,
): number | undefined => {
  for (const index of visible) {
    if (index >= positions.count) {
      continue
    }
    const box = positions.rectAt(index)
    if (x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height) {
      return index
    }
  }
  return undefined
}
