import { createEngine, masonry } from '@laynjs/core'
import { describe, expect, it } from 'vitest'
import { indexAtPoint } from './hit-test.js'

const positions = () =>
  createEngine({
    algorithm: masonry({ columns: 1 }),
    items: Array.from({ length: 5 }, (_, index) => ({ id: index, aspectRatio: 1 })),
    gap: { x: 0, y: 0 },
    viewport: { width: 100, height: 300 },
  }).getSnapshot().positions

describe('indexAtPoint', () => {
  it('finds the item whose rectangle contains the point', () => {
    expect(indexAtPoint(positions(), [0, 1, 2], 50, 150)).toBe(1)
  })

  it('only considers the given indices', () => {
    expect(indexAtPoint(positions(), [0, 2], 50, 150)).toBeUndefined()
  })

  it('returns undefined for a point outside every rectangle', () => {
    expect(indexAtPoint(positions(), [0, 1, 2], 400, 150)).toBeUndefined()
  })

  it('ignores indices beyond the position count', () => {
    expect(indexAtPoint(positions(), [99], 50, 50)).toBeUndefined()
  })
})
