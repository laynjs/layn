import { describe, expect, it } from 'vitest'
import { entriesOf, plain } from '../__fixtures__/items.js'
import { createMeasurements } from '../measurement/index.js'
import type { LayoutContext, MagazineRow } from '../types/index.js'
import { magazine } from './magazine.js'

const context = (width: number, gap: number): LayoutContext => ({
  viewport: { width, height: 800 },
  gap: { x: gap, y: gap },
  measurements: createMeasurements(),
})

const feature: readonly MagazineRow[] = [{ weights: [2, 1], height: 1 }]

describe('magazine', () => {
  it('splits each row by template weights across the full width', () => {
    const result = magazine({ templates: feature, rowHeight: 100 }).layout(
      plain(4),
      context(300, 0),
    )

    expect(result.positions.rectOf(0)).toEqual({ x: 0, y: 0, width: 200, height: 100 })
    expect(result.positions.rectOf(1)).toEqual({ x: 200, y: 0, width: 100, height: 100 })
    expect(result.positions.rectOf(2)).toEqual({ x: 0, y: 100, width: 200, height: 100 })
    expect(result.positions.rectOf(3)).toEqual({ x: 200, y: 100, width: 100, height: 100 })
  })

  it('stretches a trailing partial row to fill the width', () => {
    const result = magazine({ templates: feature, rowHeight: 100 }).layout(
      plain(3),
      context(300, 0),
    )

    expect(result.positions.rectOf(2)).toEqual({ x: 0, y: 100, width: 300, height: 100 })
    expect(result.contentSize).toEqual({ width: 300, height: 200 })
  })

  it('cycles templates and varies row height per template', () => {
    const templates: readonly MagazineRow[] = [
      { weights: [1], height: 1 },
      { weights: [1, 1], height: 0.5 },
    ]
    const result = magazine({ templates, rowHeight: 200 }).layout(plain(3), context(400, 0))

    expect(result.positions.rectOf(0)).toEqual({ x: 0, y: 0, width: 400, height: 200 })
    expect(result.positions.rectOf(1)?.height).toBe(100)
    expect(result.positions.rectOf(1)?.width).toBe(200)
    expect(result.positions.rectOf(2)?.x).toBe(200)
  })

  it('produces byte-identical layouts across independent runs (SSR/client parity)', () => {
    const items = plain(40)
    const server = magazine({ rowHeight: 240 }).layout(items, context(900, 8))
    const client = magazine({ rowHeight: 240 }).layout(items, context(900, 8))

    expect(entriesOf(client.positions)).toEqual(entriesOf(server.positions))
  })
})
