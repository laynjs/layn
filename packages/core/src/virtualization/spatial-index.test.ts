import { describe, expect, it } from 'vitest'
import { createPositions } from '../positions/index.js'
import type { ItemId, Rect, ScrollAxis, ScrollWindow } from '../types/index.js'
import { createSpatialIndex } from './spatial-index.js'

type Entry = readonly [ItemId, Rect]

const bruteForce = (
  entries: readonly Entry[],
  window: ScrollWindow,
  overscan: number,
  axis: ScrollAxis,
): ItemId[] => {
  const rangeStart = window.start - overscan
  const rangeEnd = window.start + window.size + overscan
  return entries
    .filter(([, r]) => {
      const start = axis === 'vertical' ? r.y : r.x
      const end = start + (axis === 'vertical' ? r.height : r.width)
      return end > rangeStart && start < rangeEnd
    })
    .map(([id]) => id)
}

const stack = (heights: readonly number[]): Entry[] => {
  let y = 0
  return heights.map((height, index) => {
    const entry: Entry = [index, { x: 0, y, width: 100, height }]
    y += height
    return entry
  })
}

const mulberry32 = (seed: number): (() => number) => {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('spatial index', () => {
  it('returns only items intersecting the window, in original order', () => {
    const index = createSpatialIndex(createPositions(stack([100, 100, 100, 100, 100])))

    expect(index.query({ start: 150, size: 120 })).toEqual([1, 2])
  })

  it('returns positions indices, not item ids', () => {
    const entries: Entry[] = [
      [100, { x: 0, y: 0, width: 100, height: 100 }],
      [200, { x: 0, y: 100, width: 100, height: 100 }],
      [300, { x: 0, y: 200, width: 100, height: 100 }],
    ]
    const index = createSpatialIndex(createPositions(entries))

    expect(index.query({ start: 100, size: 100 })).toEqual([1])
  })

  it('treats the window as half-open at both edges', () => {
    const index = createSpatialIndex(createPositions(stack([100, 100, 100])))

    expect(index.query({ start: 100, size: 100 })).toEqual([1])
  })

  it('expands the visible set by the overscan', () => {
    const index = createSpatialIndex(createPositions(stack([100, 100, 100, 100, 100])))

    expect(index.query({ start: 150, size: 120 }, 100)).toEqual([0, 1, 2, 3])
  })

  it('indexes items that span many bands', () => {
    const index = createSpatialIndex(
      createPositions([[0, { x: 0, y: 0, width: 100, height: 5000 }]]),
      { bandSize: 256 },
    )

    expect(index.query({ start: 4800, size: 100 })).toEqual([0])
  })

  it('supports the horizontal axis', () => {
    const entries: Entry[] = [
      [0, { x: 0, y: 0, width: 100, height: 50 }],
      [1, { x: 100, y: 0, width: 100, height: 50 }],
      [2, { x: 200, y: 0, width: 100, height: 50 }],
    ]
    const index = createSpatialIndex(createPositions(entries), { axis: 'horizontal' })

    expect(index.query({ start: 120, size: 60 })).toEqual([1])
  })

  it('matches a brute-force scan across a large randomized set', () => {
    const random = mulberry32(1337)
    const entries: Entry[] = Array.from({ length: 10000 }, (_, index) => {
      const y = Math.floor(random() * 1_000_000)
      const height = 20 + Math.floor(random() * 600)
      return [index, { x: 0, y, width: 200, height }]
    })
    const index = createSpatialIndex(createPositions(entries))

    for (let probe = 0; probe < 50; probe += 1) {
      const window: ScrollWindow = { start: Math.floor(random() * 1_000_000), size: 900 }
      const overscan = Math.floor(random() * 400)
      expect(index.query(window, overscan)).toEqual(
        bruteForce(entries, window, overscan, 'vertical'),
      )
    }
  })
})
