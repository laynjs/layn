import { createEngine, type LayoutItem, masonry } from '@laynjs/core'
import { describe, expect, it } from 'vitest'
import { buildItems } from './build-items.js'

const squares = (count: number): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({ id: index, aspectRatio: 1 }))

const snapshotOf = (gap: number) =>
  createEngine({
    algorithm: masonry({ columns: 2 }),
    viewport: { width: 320, height: 800 },
    gap: { x: gap, y: gap },
    items: squares(4),
  }).getSnapshot()

describe('buildItems', () => {
  it('maps visible items to data-driven styles', () => {
    const items = buildItems(squares(4), snapshotOf(10), [0, 1, 2, 3])

    expect(items.map((entry) => entry.style.transform)).toEqual([
      'translate(0px, 0px)',
      'translate(165px, 0px)',
      'translate(0px, 165px)',
      'translate(165px, 165px)',
    ])
  })

  it('exposes the resolved rect alongside the style', () => {
    const items = buildItems(squares(4), snapshotOf(10), [0, 1, 2, 3])

    expect(items[1]?.rect).toMatchObject({ x: 165, y: 0, width: 155, height: 155 })
    expect(items.map((entry) => entry.index)).toEqual([0, 1, 2, 3])
  })
})
