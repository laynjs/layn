import { describe, expect, it } from 'vitest'
import { entriesOf, squares } from '../__fixtures__/items.js'
import { createMeasurements } from '../measurement/index.js'
import type { LayoutContext, LayoutItem } from '../types/index.js'
import { packing } from './packing.js'

const context = (width: number, gap: number): LayoutContext => ({
  viewport: { width, height: 800 },
  gap: { x: gap, y: gap },
  measurements: createMeasurements(),
})

describe('packing', () => {
  it('tightly packs equal tiles bottom-left across the container width', () => {
    const result = packing({ baseSize: 100 }).layout(squares(3), context(210, 0))

    expect(result.positions.rectOf(0)).toEqual({ x: 0, y: 0, width: 100, height: 100 })
    expect(result.positions.rectOf(1)).toEqual({ x: 100, y: 0, width: 100, height: 100 })
    expect(result.positions.rectOf(2)).toEqual({ x: 0, y: 100, width: 100, height: 100 })
    expect(result.contentSize).toEqual({ width: 210, height: 200 })
  })

  it('clamps an item wider than the container to full width', () => {
    const items: LayoutItem[] = [{ id: 0, aspectRatio: 4 }]
    const result = packing({ baseSize: 100 }).layout(items, context(200, 0))

    expect(result.positions.rectOf(0)).toEqual({ x: 0, y: 0, width: 200, height: 50 })
  })

  it('never overlaps placed rectangles', () => {
    const items: LayoutItem[] = Array.from({ length: 60 }, (_, index) => ({
      id: index,
      aspectRatio: 0.5 + (index % 5) * 0.4,
    }))
    const result = packing({ baseSize: 90 }).layout(items, context(600, 6))
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
          first.x + first.width <= second.x ||
          second.x + second.width <= first.x ||
          first.y + first.height <= second.y ||
          second.y + second.height <= first.y
        expect(disjoint).toBe(true)
      }
    }
  })

  it('produces byte-identical layouts across independent runs (SSR/client parity)', () => {
    const items = squares(40)
    const server = packing({ baseSize: 120 }).layout(items, context(700, 8))
    const client = packing({ baseSize: 120 }).layout(items, context(700, 8))

    expect(entriesOf(client.positions)).toEqual(entriesOf(server.positions))
  })
})
