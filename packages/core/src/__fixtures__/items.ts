import type { ItemId, LayoutItem, Positions, Rect } from '../types/index.js'

export const squares = (count: number): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({ id: index, aspectRatio: 1 }))

export const squaresFrom = (start: number, count: number): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({ id: start + index, aspectRatio: 1 }))

export const plain = (count: number, start = 0): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({ id: start + index }))

export const entriesOf = (positions: Positions): Array<[ItemId, Rect]> => {
  const out: Array<[ItemId, Rect]> = []
  for (let i = 0; i < positions.count; i += 1) {
    out.push([positions.idAt(i), positions.rectAt(i)])
  }
  return out
}

export const heightSpy = (): { calls: () => number; options: { estimateHeight: () => number } } => {
  let count = 0
  return {
    calls: () => count,
    options: {
      estimateHeight: () => {
        count += 1
        return 100
      },
    },
  }
}
