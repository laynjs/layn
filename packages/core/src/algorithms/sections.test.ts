import { describe, expect, it } from 'vitest'
import { createMeasurements } from '../measurement/index.js'
import type { LayoutContext, LayoutItem } from '../types/index.js'
import { columns } from './columns.js'
import { masonry } from './masonry.js'
import { sections } from './sections.js'

const context = (width = 400, gap = 0): LayoutContext => ({
  viewport: { width, height: 800 },
  gap: { x: gap, y: gap },
  measurements: createMeasurements(),
})

const isHeader = (item: LayoutItem): boolean => (item.data as { header?: boolean })?.header === true

const head = (id: string, height = 40): LayoutItem => ({ id, height, data: { header: true } })
const tile = (id: number): LayoutItem => ({ id, aspectRatio: 1 })

const layout = (items: readonly LayoutItem[], ctx = context()) =>
  sections(masonry({ columns: 2 }), { isHeader }).layout(items, ctx)

describe('sections', () => {
  it('gives every item a position, in item order', () => {
    const items = [head('a'), tile(1), tile(2), head('b'), tile(3)]
    const result = layout(items)

    expect(result.positions.count).toBe(items.length)
    for (let i = 0; i < items.length; i += 1) {
      expect(result.positions.idAt(i)).toBe(items[i]?.id)
    }
  })

  it('lays the header full width and stacks its section underneath', () => {
    const result = layout([head('a'), tile(1), tile(2)])

    expect(result.positions.rectOf('a')).toEqual({ x: 0, y: 0, width: 400, height: 40 })
    expect(result.positions.rectOf(1)).toEqual({ x: 0, y: 40, width: 200, height: 200 })
    expect(result.positions.rectOf(2)).toEqual({ x: 200, y: 40, width: 200, height: 200 })
  })

  it('restarts the inner algorithm for each section instead of continuing it', () => {
    const result = layout([head('a'), tile(1), head('b'), tile(2)])
    const first = result.positions.rectOf(1)
    const second = result.positions.rectOf(2)

    expect(first?.x).toBe(0)
    expect(second?.x).toBe(0)
    expect(second?.y).toBe((first?.y ?? 0) + 200 + 40)
  })

  it('reports a content size that covers the last section', () => {
    const result = layout([head('a'), tile(1), tile(2), head('b'), tile(3)])

    expect(result.contentSize).toEqual({ width: 400, height: 480 })
  })

  it('separates sections by sectionGap, falling back to the vertical gap', () => {
    const items = [head('a'), tile(1), head('b'), tile(2)]
    const spaced = sections(masonry({ columns: 2 }), { isHeader, sectionGap: 100 }).layout(
      items,
      context(),
    )

    expect(spaced.positions.rectOf('b')?.y).toBe(40 + 200 + 100)
  })

  it('places items that appear before the first header in their own leading section', () => {
    const result = layout([tile(1), head('a'), tile(2)])

    expect(result.positions.rectOf(1)).toEqual({ x: 0, y: 0, width: 200, height: 200 })
    expect(result.positions.rectOf('a')?.y).toBe(200)
    expect(result.positions.rectOf(2)?.y).toBe(240)
  })

  it('handles an empty section between two headers', () => {
    const result = layout([head('a'), head('b'), tile(1)])

    expect(result.positions.rectOf('a')).toEqual({ x: 0, y: 0, width: 400, height: 40 })
    expect(result.positions.rectOf('b')?.y).toBe(40)
    expect(result.positions.rectOf(1)?.y).toBe(80)
  })

  it('behaves like the inner algorithm when there are no headers at all', () => {
    const items = [tile(1), tile(2), tile(3)]
    const grouped = layout(items)
    const plain = masonry({ columns: 2 }).layout(items, context())

    for (let i = 0; i < items.length; i += 1) {
      expect(grouped.positions.rectAt(i)).toEqual(plain.positions.rectAt(i))
    }
    expect(grouped.contentSize).toEqual(plain.contentSize)
  })

  it('never overlaps across section boundaries', () => {
    const items: LayoutItem[] = []
    for (let s = 0; s < 6; s += 1) {
      items.push(head(`h${s}`, 30 + s * 4))
      for (let i = 0; i < 7; i += 1) {
        items.push({ id: s * 10 + i, aspectRatio: 0.7 + i * 0.2 })
      }
    }
    const result = sections(masonry({ columns: 3 }), { isHeader }).layout(items, context(600, 12))
    const rects = Array.from({ length: result.positions.count }, (_, i) =>
      result.positions.rectAt(i),
    )

    for (let a = 0; a < rects.length; a += 1) {
      for (let b = a + 1; b < rects.length; b += 1) {
        const first = rects[a] ?? { x: 0, y: 0, width: 0, height: 0 }
        const second = rects[b] ?? { x: 0, y: 0, width: 0, height: 0 }
        const disjoint =
          first.x + first.width <= second.x + 0.001 ||
          second.x + second.width <= first.x + 0.001 ||
          first.y + first.height <= second.y + 0.001 ||
          second.y + second.height <= first.y + 0.001
        expect(disjoint).toBe(true)
      }
    }
  })

  it('mirrors sections when the direction is rtl, keeping headers full width', () => {
    const items = [head('a'), tile(1), tile(2)]
    const rtl = sections(masonry({ columns: 2 }), { isHeader }).layout(items, {
      ...context(),
      direction: 'rtl',
    })

    expect(rtl.positions.rectOf('a')).toEqual({ x: 0, y: 0, width: 400, height: 40 })
    expect(rtl.positions.rectOf(1)?.x).toBe(200)
    expect(rtl.positions.rectOf(2)?.x).toBe(0)
  })

  it('composes with any inner algorithm and reports a composed name', () => {
    const algorithm = sections(columns({ columns: 2 }), { isHeader })

    expect(algorithm.name).toBe('sections(columns)')
    expect(algorithm.capabilities.incremental).toBe(false)
  })

  it('produces byte-identical layouts across independent runs (SSR/client parity)', () => {
    const items = [head('a'), tile(1), tile(2), head('b'), tile(3), tile(4)]
    const server = layout(items)
    const client = layout(items)

    for (let i = 0; i < items.length; i += 1) {
      expect(client.positions.rectAt(i)).toEqual(server.positions.rectAt(i))
    }
  })
})
