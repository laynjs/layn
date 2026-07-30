import { createEngine, type ItemId, type LayoutItem, masonry } from '@laynjs/core'
import { describe, expect, it } from 'vitest'
import { buildItems } from './build-items.js'

const squares = (count: number): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({ id: index, aspectRatio: 1 }))

const refFor = (_id: ItemId) => () => undefined

describe('buildItems', () => {
  it('maps visible indices to positioned items', () => {
    const engine = createEngine({
      algorithm: masonry({ columns: 2 }),
      gap: { x: 10, y: 10 },
      viewport: { width: 320, height: 800 },
      items: squares(4),
    })

    const built = buildItems(squares(4), engine.getSnapshot(), [0, 1], refFor)

    expect(built).toHaveLength(2)
    expect(built[0]?.id).toBe(0)
    expect(built[0]?.style.transform).toBe('translate(0px, 0px)')
    expect(built[0]?.style.width).toBe(155)
    expect(built[1]?.style.transform).toBe('translate(165px, 0px)')
    expect(built[0]?.a11y).toEqual({ role: 'listitem', 'aria-setsize': 4, 'aria-posinset': 1 })
    expect(built[1]?.a11y['aria-posinset']).toBe(2)
  })

  it('skips indices without a matching item', () => {
    const engine = createEngine({
      algorithm: masonry({ columns: 1 }),
      viewport: { width: 100, height: 800 },
      items: squares(3),
    })

    const built = buildItems(squares(3), engine.getSnapshot(), [0, 1, 2, 99], refFor)

    expect(built).toHaveLength(3)
  })
})
