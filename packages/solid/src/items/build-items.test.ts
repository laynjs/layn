import { createEngine, type LayoutItem, masonry } from '@laynjs/core'
import { describe, expect, it } from 'vitest'
import { createItemBuilder } from './build-items.js'

const squares = (count: number): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({ id: index, aspectRatio: 1 }))

const snapshotOf = (gap: number) =>
  createEngine({
    algorithm: masonry({ columns: 2 }),
    viewport: { width: 320, height: 800 },
    gap: { x: gap, y: gap },
    items: squares(4),
  }).getSnapshot()

describe('createItemBuilder', () => {
  it('maps visible items to data-driven styles', () => {
    const build = createItemBuilder(() => () => undefined)
    const items = build(squares(4), snapshotOf(10), [0, 1, 2, 3])

    expect(items.map((entry) => entry.style.transform)).toEqual([
      'translate(0px, 0px)',
      'translate(165px, 0px)',
      'translate(0px, 165px)',
      'translate(165px, 165px)',
    ])
  })

  it('returns stable references when position is unchanged (For reuse)', () => {
    const build = createItemBuilder(() => () => undefined)
    const items = squares(4)
    const snapshot = snapshotOf(10)
    const first = build(items, snapshot, [0, 1, 2, 3])
    const second = build(items, snapshot, [0, 1, 2, 3])

    expect(second[0]).toBe(first[0])
    expect(second[3]).toBe(first[3])
  })

  it('produces a new reference when an item rect changes', () => {
    const build = createItemBuilder(() => () => undefined)
    const items = squares(4)
    const first = build(items, snapshotOf(10), [0, 1, 2, 3])
    const second = build(items, snapshotOf(20), [0, 1, 2, 3])

    expect(second[1]).not.toBe(first[1])
  })
})
