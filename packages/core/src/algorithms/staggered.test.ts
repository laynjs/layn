import { describe, expect, it } from 'vitest'
import { entriesOf, squares } from '../__fixtures__/items.js'
import { createMeasurements } from '../measurement/index.js'
import type { LayoutContext } from '../types/index.js'
import { staggered } from './staggered.js'

const context = (width: number, gap: number): LayoutContext => ({
  viewport: { width, height: 800 },
  gap: { x: gap, y: gap },
  measurements: createMeasurements(),
})

describe('staggered', () => {
  it('offsets alternating columns by the stagger fraction of the column width', () => {
    const result = staggered({ columns: 2, stagger: 0.5 }).layout(squares(4), context(210, 10))

    expect(result.positions.rectOf(0)).toEqual({ x: 0, y: 0, width: 100, height: 100 })
    expect(result.positions.rectOf(1)).toEqual({ x: 110, y: 50, width: 100, height: 100 })
    expect(result.positions.rectOf(2)).toEqual({ x: 0, y: 110, width: 100, height: 100 })
    expect(result.positions.rectOf(3)).toEqual({ x: 110, y: 160, width: 100, height: 100 })
  })

  it('collapses to plain columns when stagger is zero', () => {
    const result = staggered({ columns: 2, stagger: 0 }).layout(squares(2), context(210, 10))

    expect(result.positions.rectOf(0)?.y).toBe(0)
    expect(result.positions.rectOf(1)?.y).toBe(0)
  })

  it('produces byte-identical layouts across independent runs (SSR/client parity)', () => {
    const items = squares(40)
    const server = staggered({ columns: 4 }).layout(items, context(900, 8))
    const client = staggered({ columns: 4 }).layout(items, context(900, 8))

    expect(entriesOf(client.positions)).toEqual(entriesOf(server.positions))
  })
})
