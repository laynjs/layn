import { describe, expect, it } from 'vitest'
import { entriesOf, squares } from '../__fixtures__/items.js'
import { createMeasurements } from '../measurement/index.js'
import type { LayoutContext } from '../types/index.js'
import { columns } from './columns.js'

const context = (width: number, gap: number): LayoutContext => ({
  viewport: { width, height: 800 },
  gap: { x: gap, y: gap },
  measurements: createMeasurements(),
})

describe('columns', () => {
  it('assigns items round-robin across equal-width columns', () => {
    const result = columns({ columns: 2 }).layout(squares(4), context(220, 20))

    expect(result.positions.rectOf(0)).toEqual({ x: 0, y: 0, width: 100, height: 100 })
    expect(result.positions.rectOf(1)).toEqual({ x: 120, y: 0, width: 100, height: 100 })
    expect(result.positions.rectOf(2)).toEqual({ x: 0, y: 120, width: 100, height: 100 })
    expect(result.positions.rectOf(3)).toEqual({ x: 120, y: 120, width: 100, height: 100 })
    expect(result.contentSize).toEqual({ width: 220, height: 220 })
  })

  it('preserves source order within each column, unlike shortest-column masonry', () => {
    const items = [
      { id: 0, aspectRatio: 1 },
      { id: 1, aspectRatio: 0.5 },
      { id: 2, aspectRatio: 1 },
    ]
    const result = columns({ columns: 2 }).layout(items, context(210, 10))

    expect(result.positions.rectOf(2)?.x).toBe(0)
    expect(result.positions.rectOf(2)?.y).toBe(110)
  })

  it('produces byte-identical layouts across independent runs (SSR/client parity)', () => {
    const items = squares(40)
    const server = columns({ columns: 4 }).layout(items, context(900, 8))
    const client = columns({ columns: 4 }).layout(items, context(900, 8))

    expect(entriesOf(client.positions)).toEqual(entriesOf(server.positions))
  })
})
