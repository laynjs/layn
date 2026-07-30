import { describe, expect, it } from 'vitest'
import { entriesOf, squares } from '../__fixtures__/items.js'
import { createMeasurements } from '../measurement/index.js'
import type { LayoutContext } from '../types/index.js'
import { masonry } from './masonry.js'

const context = (width: number, gap: number): LayoutContext => ({
  viewport: { width, height: 800 },
  gap: { x: gap, y: gap },
  measurements: createMeasurements(),
})

describe('masonry', () => {
  it('places items into the shortest column, left-biased on ties', () => {
    const result = masonry({ columns: 2 }).layout(squares(4), context(320, 10))

    expect(result.positions.rectOf(0)).toEqual({ x: 0, y: 0, width: 155, height: 155 })
    expect(result.positions.rectOf(1)).toEqual({ x: 165, y: 0, width: 155, height: 155 })
    expect(result.positions.rectOf(2)).toEqual({ x: 0, y: 165, width: 155, height: 155 })
    expect(result.positions.rectOf(3)).toEqual({ x: 165, y: 165, width: 155, height: 155 })
  })

  it('reports content size as the tallest column without the trailing gap', () => {
    const result = masonry({ columns: 2 }).layout(squares(4), context(320, 10))

    expect(result.contentSize).toEqual({ width: 320, height: 320 })
  })

  it('derives column count from a target column width', () => {
    const result = masonry({ columnWidth: 150 }).layout(squares(1), context(320, 10))

    expect(result.positions.rectOf(0)?.width).toBeCloseTo(155)
  })

  it('incremental append reproduces a full layout exactly', () => {
    const ctx = context(600, 12)
    const all = squares(40)
    const previous = masonry({ columns: 3 }).layout(all.slice(0, 25), ctx)
    const incremental = masonry({ columns: 3 }).layout(all, ctx, previous)
    const full = masonry({ columns: 3 }).layout(all, ctx)

    expect(entriesOf(incremental.positions)).toEqual(entriesOf(full.positions))
    expect(incremental.contentSize).toEqual(full.contentSize)
  })

  it('falls back to a full layout when the column count changes', () => {
    const ctx = context(600, 12)
    const all = squares(20)
    const previous = masonry({ columns: 2 }).layout(all.slice(0, 10), ctx)
    const relaidOut = masonry({ columns: 4 }).layout(all, ctx, previous)
    const full = masonry({ columns: 4 }).layout(all, ctx)

    expect(entriesOf(relaidOut.positions)).toEqual(entriesOf(full.positions))
  })

  it('produces byte-identical layouts across independent runs (SSR/client parity)', () => {
    const items = squares(50)
    const server = masonry({ columns: 4 }).layout(items, context(600, 12))
    const client = masonry({ columns: 4 }).layout(items, context(600, 12))

    expect(entriesOf(client.positions)).toEqual(entriesOf(server.positions))
    expect(client.contentSize).toEqual(server.contentSize)
  })
})
