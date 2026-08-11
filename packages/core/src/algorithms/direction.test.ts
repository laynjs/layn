import { describe, expect, it } from 'vitest'
import { squares, squaresFrom } from '../__fixtures__/items.js'
import { createMeasurements } from '../measurement/index.js'
import type { LayoutAlgorithm, LayoutContext } from '../types/index.js'
import { binPacking } from './bin-packing.js'
import { columns } from './columns.js'
import { horizontalMasonry } from './horizontal-masonry.js'
import { justified } from './justified.js'
import { magazine } from './magazine.js'
import { masonry } from './masonry.js'
import { packing } from './packing.js'
import { quilt } from './quilt.js'
import { staggered } from './staggered.js'

const VIEWPORT_WIDTH = 640

const context = (rtl: boolean): LayoutContext => ({
  viewport: { width: VIEWPORT_WIDTH, height: 800 },
  gap: { x: 12, y: 12 },
  measurements: createMeasurements(),
  ...(rtl ? { direction: 'rtl' as const } : {}),
})

const mirrored: ReadonlyArray<readonly [string, LayoutAlgorithm]> = [
  ['masonry', masonry({ columns: 3 })],
  ['columns', columns({ columns: 3 })],
  ['staggered', staggered({ columns: 3 })],
  ['justified', justified({ targetRowHeight: 120 })],
  ['magazine', magazine({ rowHeight: 160 })],
  ['packing', packing({ baseSize: 120 })],
  ['bin-packing', binPacking({ baseSize: 120 })],
  ['quilt', quilt({ columns: 3 })],
]

describe.each(mirrored)('%s in rtl', (_name, algorithm) => {
  it('mirrors every rect across the container, leaving the vertical layout untouched', () => {
    const items = squares(24)
    const ltr = algorithm.layout(items, context(false))
    const rtl = algorithm.layout(items, context(true))

    expect(rtl.positions.count).toBe(ltr.positions.count)
    expect(rtl.contentSize).toEqual(ltr.contentSize)
    for (let i = 0; i < ltr.positions.count; i += 1) {
      const before = ltr.positions.rectAt(i)
      const after = rtl.positions.rectAt(i)

      expect(after.y).toBe(before.y)
      expect(after.width).toBe(before.width)
      expect(after.height).toBe(before.height)
      expect(after.x).toBeCloseTo(VIEWPORT_WIDTH - before.x - before.width, 10)
    }
  })

  it('keeps every item inside the container', () => {
    const rtl = algorithm.layout(squares(24), context(true))

    for (let i = 0; i < rtl.positions.count; i += 1) {
      const rect = rtl.positions.rectAt(i)
      expect(rect.x).toBeGreaterThanOrEqual(-0.0001)
      expect(rect.x + rect.width).toBeLessThanOrEqual(VIEWPORT_WIDTH + 0.0001)
    }
  })
})

describe('rtl edge cases', () => {
  it('puts the first masonry item against the right edge', () => {
    const rtl = masonry({ columns: 2 }).layout(squares(2), {
      viewport: { width: 320, height: 800 },
      gap: { x: 20, y: 20 },
      measurements: createMeasurements(),
      direction: 'rtl',
    })

    expect(rtl.positions.rectOf(0)).toEqual({ x: 170, y: 0, width: 150, height: 150 })
    expect(rtl.positions.rectOf(1)).toEqual({ x: 0, y: 0, width: 150, height: 150 })
  })

  it('is a no-op when the direction is explicitly ltr', () => {
    const items = squares(9)
    const plain = masonry({ columns: 3 }).layout(items, context(false))
    const explicit = masonry({ columns: 3 }).layout(items, {
      ...context(false),
      direction: 'ltr',
    })

    expect(explicit.positions.rectAt(0)).toEqual(plain.positions.rectAt(0))
  })

  it('keeps masonry appends stable, so incremental still equals a full recompute', () => {
    const all = squares(30)
    const previous = masonry({ columns: 3 }).layout(all.slice(0, 18), context(true))
    const incremental = masonry({ columns: 3 }).layout(all, context(true), previous)
    const full = masonry({ columns: 3 }).layout(all, context(true))

    for (let i = 0; i < full.positions.count; i += 1) {
      expect(incremental.positions.rectAt(i)).toEqual(full.positions.rectAt(i))
    }
  })

  it('mirrors items appended later against the same container width', () => {
    const first = masonry({ columns: 3 }).layout(squares(6), context(true))
    const grown = masonry({ columns: 3 }).layout(
      [...squares(6), ...squaresFrom(6, 6)],
      context(true),
      first,
    )

    for (let i = 0; i < grown.positions.count; i += 1) {
      const rect = grown.positions.rectAt(i)
      expect(rect.x + rect.width).toBeLessThanOrEqual(VIEWPORT_WIDTH + 0.0001)
    }
  })

  it('leaves horizontal masonry alone, since its content grows past the container', () => {
    const items = squares(12)
    const ltr = horizontalMasonry({ rows: 2 }).layout(items, context(false))
    const rtl = horizontalMasonry({ rows: 2 }).layout(items, context(true))

    expect(rtl.positions.rectAt(0)).toEqual(ltr.positions.rectAt(0))
    expect(rtl.contentSize).toEqual(ltr.contentSize)
  })
})
