import { describe, expect, it } from 'vitest'
import { entriesOf, plain } from '../__fixtures__/items.js'
import { createMeasurements } from '../measurement/index.js'
import type { LayoutContext } from '../types/index.js'
import { quilt } from './quilt.js'

const context = (width: number, gap: number): LayoutContext => ({
  viewport: { width, height: 800 },
  gap: { x: gap, y: gap },
  measurements: createMeasurements(),
})

describe('quilt', () => {
  it('places template spans into a grid, filling gaps around large cells', () => {
    const result = quilt({ columns: 4 }).layout(plain(4), context(400, 0))

    expect(result.positions.rectOf(0)).toEqual({ x: 0, y: 0, width: 200, height: 200 })
    expect(result.positions.rectOf(1)).toEqual({ x: 200, y: 0, width: 100, height: 100 })
    expect(result.positions.rectOf(2)).toEqual({ x: 300, y: 0, width: 100, height: 100 })
    expect(result.positions.rectOf(3)).toEqual({ x: 200, y: 100, width: 100, height: 200 })
  })

  it('respects gaps between grid cells', () => {
    const result = quilt({ columns: 4, pattern: [[2, 2]] }).layout(plain(1), context(412, 4))

    expect(result.positions.rectOf(0)).toEqual({ x: 0, y: 0, width: 204, height: 204 })
  })

  it('never overlaps and clamps spans to the column count', () => {
    const result = quilt({ columns: 3, pattern: [[5, 1]] }).layout(plain(30), context(300, 0))
    const rects = Array.from({ length: result.positions.count }, (_, i) =>
      result.positions.rectAt(i),
    )

    for (const rect of rects) {
      expect(rect.width).toBeLessThanOrEqual(300)
    }
    for (let a = 0; a < rects.length; a += 1) {
      for (let b = a + 1; b < rects.length; b += 1) {
        const first = rects[a]
        const second = rects[b]
        if (first === undefined || second === undefined) {
          continue
        }
        const disjoint =
          first.x + first.width <= second.x ||
          second.x + second.width <= first.x ||
          first.y + first.height <= second.y ||
          second.y + second.height <= first.y
        expect(disjoint).toBe(true)
      }
    }
  })

  it('fills every grid cell without gaps or overlaps at scale', () => {
    const columns = 5
    const result = quilt({ columns }).layout(plain(2000), context(500, 0))
    const cells = new Set<string>()
    const cellSize = 100

    for (let i = 0; i < result.positions.count; i += 1) {
      const rect = result.positions.rectAt(i)
      const col0 = Math.round(rect.x / cellSize)
      const row0 = Math.round(rect.y / cellSize)
      const cs = Math.round(rect.width / cellSize)
      const rs = Math.round(rect.height / cellSize)
      for (let dr = 0; dr < rs; dr += 1) {
        for (let dc = 0; dc < cs; dc += 1) {
          const key = `${row0 + dr}:${col0 + dc}`
          expect(cells.has(key)).toBe(false)
          cells.add(key)
          expect(col0 + dc).toBeLessThan(columns)
        }
      }
    }
  })

  it('produces byte-identical layouts across independent runs (SSR/client parity)', () => {
    const items = plain(40)
    const server = quilt({ columns: 5 }).layout(items, context(900, 8))
    const client = quilt({ columns: 5 }).layout(items, context(900, 8))

    expect(entriesOf(client.positions)).toEqual(entriesOf(server.positions))
  })
})
