import { describe, expect, it } from 'vitest'
import { entriesOf } from '../__fixtures__/items.js'
import { createMeasurements } from '../measurement/index.js'
import type { LayoutContext, LayoutItem } from '../types/index.js'
import { justified } from './justified.js'

const squares = (count: number): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({ id: index, aspectRatio: 1 }))

const context = (width: number, gap: number): LayoutContext => ({
  viewport: { width, height: 800 },
  gap: { x: gap, y: gap },
  measurements: createMeasurements(),
})

describe('justified', () => {
  it('scales a full row to fill the viewport width', () => {
    const result = justified({ targetRowHeight: 100 }).layout(squares(3), context(320, 10))

    expect(result.positions.rectOf(0)).toEqual({ x: 0, y: 0, width: 100, height: 100 })
    expect(result.positions.rectOf(1)).toEqual({ x: 110, y: 0, width: 100, height: 100 })
    expect(result.positions.rectOf(2)).toEqual({ x: 220, y: 0, width: 100, height: 100 })
    expect(result.contentSize).toEqual({ width: 320, height: 100 })
  })

  it('does not stretch a trailing partial row', () => {
    const result = justified({ targetRowHeight: 100 }).layout(squares(4), context(320, 10))
    const last = result.positions.rectOf(3)

    expect(last?.y).toBe(110)
    expect(last?.width).toBe(100)
    expect(last?.height).toBe(100)
  })

  it('breaks rows by aspect ratio, keeping wide items fewer per row', () => {
    const items: LayoutItem[] = [
      { id: 0, aspectRatio: 2 },
      { id: 1, aspectRatio: 2 },
      { id: 2, aspectRatio: 2 },
    ]
    const result = justified({ targetRowHeight: 100 }).layout(items, context(320, 0))

    expect(result.positions.rectOf(0)?.y).toBe(0)
    expect(result.positions.rectOf(1)?.y).toBe(0)
    expect(result.positions.rectOf(2)).toEqual({ x: 0, y: 80, width: 200, height: 100 })
  })

  it('produces byte-identical layouts across independent runs (SSR/client parity)', () => {
    const items = squares(40)
    const server = justified({ targetRowHeight: 180 }).layout(items, context(900, 8))
    const client = justified({ targetRowHeight: 180 }).layout(items, context(900, 8))

    expect(entriesOf(client.positions)).toEqual(entriesOf(server.positions))
  })
})
