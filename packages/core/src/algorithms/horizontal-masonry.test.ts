import { describe, expect, it } from 'vitest'
import { entriesOf, squares } from '../__fixtures__/items.js'
import { createMeasurements } from '../measurement/index.js'
import type { LayoutContext, LayoutItem } from '../types/index.js'
import { horizontalMasonry } from './horizontal-masonry.js'

const context = (height: number, gap: number): LayoutContext => ({
  viewport: { width: 800, height },
  gap: { x: gap, y: gap },
  measurements: createMeasurements(),
})

describe('horizontalMasonry', () => {
  it('flows items into the shortest row, growing horizontally', () => {
    const result = horizontalMasonry({ rows: 2 }).layout(squares(4), context(220, 20))

    expect(result.positions.rectOf(0)).toEqual({ x: 0, y: 0, width: 100, height: 100 })
    expect(result.positions.rectOf(1)).toEqual({ x: 0, y: 120, width: 100, height: 100 })
    expect(result.positions.rectOf(2)).toEqual({ x: 120, y: 0, width: 100, height: 100 })
    expect(result.positions.rectOf(3)).toEqual({ x: 120, y: 120, width: 100, height: 100 })
    expect(result.contentSize).toEqual({ width: 220, height: 220 })
  })

  it('sizes item width from aspect ratio at the fixed row height', () => {
    const items: LayoutItem[] = [{ id: 0, aspectRatio: 2 }]
    const result = horizontalMasonry({ rows: 1 }).layout(items, context(200, 0))

    expect(result.positions.rectOf(0)).toEqual({ x: 0, y: 0, width: 400, height: 200 })
  })

  it('produces byte-identical layouts across independent runs (SSR/client parity)', () => {
    const items = squares(40)
    const server = horizontalMasonry({ rows: 3 }).layout(items, context(620, 8))
    const client = horizontalMasonry({ rows: 3 }).layout(items, context(620, 8))

    expect(entriesOf(client.positions)).toEqual(entriesOf(server.positions))
  })
})
