import { describe, expect, it } from 'vitest'
import type { LayoutAlgorithm, LayoutContext, LayoutItem, LayoutResult } from '../index.js'
import {
  createMeasurements,
  createPositionsBuilder,
  mirrorExtent,
  resolveColumnCount,
  resolveTrackSize,
} from '../index.js'

const shelf = (options: { rowHeight?: number } = {}): LayoutAlgorithm => ({
  name: 'shelf',
  capabilities: { incremental: false, requiresMeasuredHeight: false },

  layout(items: readonly LayoutItem[], context: LayoutContext): LayoutResult {
    const { viewport, gap, measurements } = context
    const rowHeight = options.rowHeight ?? 200
    const builder = createPositionsBuilder(items.length, mirrorExtent(context))
    let x = 0
    let y = 0

    for (const item of items) {
      const width = measurements.aspectRatio(item) * rowHeight
      if (x > 0 && x + width > viewport.width) {
        x = 0
        y += rowHeight + gap.y
      }
      builder.push(item.id, x, y, width, rowHeight)
      x += width + gap.x
    }

    return {
      positions: builder.build(),
      contentSize: { width: viewport.width, height: y + rowHeight },
    }
  },
})

const context = (width: number, direction?: 'ltr' | 'rtl'): LayoutContext => ({
  viewport: { width, height: 600 },
  gap: { x: 10, y: 10 },
  measurements: createMeasurements(),
  ...(direction === undefined ? {} : { direction }),
})

const tiles = (count: number): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({ id: index, aspectRatio: 1 + (index % 3) * 0.5 }))

describe('authoring a layout algorithm from the public API', () => {
  it('places every item and reports the content extent', () => {
    const result = shelf({ rowHeight: 100 }).layout(tiles(8), context(500))

    expect(result.positions.count).toBe(8)
    expect(result.positions.rectAt(0)).toEqual({ x: 0, y: 0, width: 100, height: 100 })
    expect(result.contentSize.height).toBe(result.positions.rectAt(7).y + 100)
  })

  it('wraps rows without leaving the container', () => {
    const result = shelf({ rowHeight: 100 }).layout(tiles(30), context(500))

    for (let i = 0; i < result.positions.count; i += 1) {
      const rect = result.positions.rectAt(i)
      expect(rect.x).toBeGreaterThanOrEqual(0)
      expect(rect.x + rect.width).toBeLessThanOrEqual(500.01)
    }
  })

  it('is deterministic across runs', () => {
    const a = shelf().layout(tiles(50), context(800))
    const b = shelf().layout(tiles(50), context(800))

    expect(Array.from(a.positions.x)).toEqual(Array.from(b.positions.x))
    expect(Array.from(a.positions.y)).toEqual(Array.from(b.positions.y))
  })

  it('mirrors for rtl through mirrorExtent alone', () => {
    const ltr = shelf({ rowHeight: 100 }).layout(tiles(12), context(500))
    const rtl = shelf({ rowHeight: 100 }).layout(tiles(12), context(500, 'rtl'))

    for (let i = 0; i < ltr.positions.count; i += 1) {
      const left = ltr.positions.rectAt(i)
      const mirrored = rtl.positions.rectAt(i)
      expect(mirrored.x).toBeCloseTo(500 - left.x - left.width, 6)
      expect(mirrored.y).toBe(left.y)
    }
  })

  it('resolves responsive track counts against the container', () => {
    const options = { columns: { 0: 1, 600: 3, 1200: 5 } }

    expect(resolveColumnCount(options, 400, 10)).toBe(1)
    expect(resolveColumnCount(options, 800, 10)).toBe(3)
    expect(resolveTrackSize(800, 3, 10)).toBeCloseTo((800 - 20) / 3, 6)
  })
})
