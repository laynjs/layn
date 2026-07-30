import { describe, expect, it } from 'vitest'
import { entriesOf, squares } from '../__fixtures__/items.js'
import { createMeasurements } from '../measurement/index.js'
import type { LayoutContext, LayoutItem } from '../types/index.js'
import { binPacking } from './bin-packing.js'

const context = (width: number, gap: number): LayoutContext => ({
  viewport: { width, height: 800 },
  gap: { x: gap, y: gap },
  measurements: createMeasurements(),
})

describe('binPacking', () => {
  it('places equal tiles into a maximal-rectangles grid', () => {
    const result = binPacking({ baseSize: 100 }).layout(squares(3), context(210, 0))

    expect(result.positions.rectOf(0)).toEqual({ x: 0, y: 0, width: 100, height: 100 })
    expect(result.positions.rectOf(1)).toEqual({ x: 100, y: 0, width: 100, height: 100 })
    expect(result.positions.rectOf(2)).toEqual({ x: 0, y: 100, width: 100, height: 100 })
  })

  it('clamps an item wider than the container to full width', () => {
    const items: LayoutItem[] = [{ id: 0, aspectRatio: 4 }]
    const result = binPacking({ baseSize: 100 }).layout(items, context(200, 0))

    expect(result.positions.rectOf(0)).toEqual({ x: 0, y: 0, width: 200, height: 50 })
  })

  it('never overlaps placed rectangles, even past the free-rect retirement cap', () => {
    const items: LayoutItem[] = Array.from({ length: 600 }, (_, index) => ({
      id: index,
      aspectRatio: 0.5 + (index % 6) * 0.35,
    }))
    const result = binPacking({ baseSize: 90 }).layout(items, context(600, 6))
    const rects = Array.from({ length: result.positions.count }, (_, i) =>
      result.positions.rectAt(i),
    )

    for (let a = 0; a < rects.length; a += 1) {
      for (let b = a + 1; b < rects.length; b += 1) {
        const first = rects[a]
        const second = rects[b]
        if (first === undefined || second === undefined) {
          continue
        }
        const disjoint =
          first.x + first.width <= second.x + 1e-6 ||
          second.x + second.width <= first.x + 1e-6 ||
          first.y + first.height <= second.y + 1e-6 ||
          second.y + second.height <= first.y + 1e-6
        expect(disjoint).toBe(true)
      }
    }
  })

  it('produces byte-identical layouts across independent runs (SSR/client parity)', () => {
    const items = squares(40)
    const server = binPacking({ baseSize: 120 }).layout(items, context(700, 8))
    const client = binPacking({ baseSize: 120 }).layout(items, context(700, 8))

    expect(entriesOf(client.positions)).toEqual(entriesOf(server.positions))
  })
})
