import { describe, expect, it, vi } from 'vitest'
import { entriesOf, heightSpy, plain, squares, squaresFrom } from '../__fixtures__/items.js'
import { masonry } from '../algorithms/index.js'
import { LaynError } from '../errors/index.js'
import type { LayoutAlgorithm, LayoutItem } from '../types/index.js'
import { createEngine } from './engine.js'
import { hydrateEngine } from './hydrate.js'

describe('engine', () => {
  it('computes an initial snapshot from config', () => {
    const engine = createEngine({
      algorithm: masonry({ columns: 2 }),
      gap: { x: 10, y: 10 },
      viewport: { width: 320, height: 800 },
      items: squares(2),
    })

    const snapshot = engine.getSnapshot()

    expect(snapshot.positions.rectOf(0)).toEqual({ x: 0, y: 0, width: 155, height: 155 })
    expect(snapshot.positions.rectOf(1)).toEqual({ x: 165, y: 0, width: 155, height: 155 })
  })

  it('keeps a stable snapshot reference until state changes', () => {
    const engine = createEngine({
      algorithm: masonry({ columns: 2 }),
      viewport: { width: 320, height: 800 },
      items: squares(2),
    })

    const first = engine.getSnapshot()
    expect(engine.getSnapshot()).toBe(first)

    engine.setViewport({ width: 640, height: 800 })
    expect(engine.getSnapshot()).not.toBe(first)
  })

  it('notifies subscribers on change and stops after unsubscribe', () => {
    const engine = createEngine({
      algorithm: masonry({ columns: 2 }),
      viewport: { width: 320, height: 800 },
      items: squares(1),
    })
    const listener = vi.fn()
    const unsubscribe = engine.subscribe(listener)

    engine.setItems(squares(2))
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    engine.setItems(squares(3))
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('only recomputes when a measurement actually changes', () => {
    const engine = createEngine({
      algorithm: masonry({ columns: 1 }),
      viewport: { width: 100, height: 800 },
      items: squares(1),
    })
    const listener = vi.fn()
    engine.subscribe(listener)

    engine.measure([{ id: 0, size: { width: 100, height: 250 } }])
    expect(engine.getSnapshot().positions.rectOf(0)?.height).toBe(250)
    expect(listener).toHaveBeenCalledTimes(1)

    engine.measure([{ id: 0, size: { width: 100, height: 250 } }])
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('returns the virtualized visible set for a scroll window', () => {
    const engine = createEngine({
      algorithm: masonry({ columns: 1 }),
      viewport: { width: 100, height: 300 },
      items: squares(20),
    })

    expect(engine.getVisible({ start: 0, size: 300 })).toEqual([0, 1, 2])
    expect(engine.getVisible({ start: 500, size: 300 })).toEqual([5, 6, 7])
  })

  it('recomputes the visible set after the layout changes', () => {
    const engine = createEngine({
      algorithm: masonry({ columns: 1 }),
      viewport: { width: 100, height: 300 },
      items: squares(20),
    })

    expect(engine.getVisible({ start: 0, size: 300 })).toEqual([0, 1, 2])

    engine.measure([{ id: 0, size: { width: 100, height: 300 } }])
    expect(engine.getVisible({ start: 0, size: 300 })).toEqual([0])
  })

  it('appends incrementally, measuring only the newly added items', () => {
    const spy = heightSpy()
    const engine = createEngine({
      algorithm: masonry({ columns: 2 }),
      viewport: { width: 320, height: 800 },
      items: plain(10),
      measurements: spy.options,
    })
    expect(spy.calls()).toBe(10)

    engine.appendItems(plain(5, 10))
    expect(spy.calls()).toBe(15)
  })

  it('append yields the same layout as building the full set at once', () => {
    const build = (items: LayoutItem[]) =>
      createEngine({
        algorithm: masonry({ columns: 3 }),
        gap: { x: 12, y: 12 },
        viewport: { width: 600, height: 800 },
        items,
      })

    const incremental = build(squares(20))
    incremental.appendItems(squaresFrom(20, 15))
    const full = build([...squares(20), ...squaresFrom(20, 15)])

    expect(entriesOf(incremental.getSnapshot().positions)).toEqual(
      entriesOf(full.getSnapshot().positions),
    )
    expect(incremental.getSnapshot().contentSize).toEqual(full.getSnapshot().contentSize)
  })

  it('skips everything when the same items array is set again', () => {
    const list = squares(3)
    const engine = createEngine({
      algorithm: masonry({ columns: 2 }),
      viewport: { width: 320, height: 800 },
      items: list,
    })
    const before = engine.getSnapshot()
    const listener = vi.fn()
    engine.subscribe(listener)

    engine.setItems(list)

    expect(listener).not.toHaveBeenCalled()
    expect(engine.getSnapshot()).toBe(before)
  })

  it('refreshes items without recomputing layout when only data changes', () => {
    const spy = heightSpy()
    const engine = createEngine({
      algorithm: masonry({ columns: 2 }),
      viewport: { width: 320, height: 800 },
      items: plain(5),
      measurements: spy.options,
    })
    expect(spy.calls()).toBe(5)

    engine.setItems(Array.from({ length: 5 }, (_, index) => ({ id: index, data: index })))

    expect(spy.calls()).toBe(5)
    expect(engine.getSnapshot().items[0]?.data).toBe(0)
  })

  it('auto-detects an append through setItems and measures only new items', () => {
    const spy = heightSpy()
    const base = plain(10)
    const engine = createEngine({
      algorithm: masonry({ columns: 2 }),
      viewport: { width: 320, height: 800 },
      items: base,
      measurements: spy.options,
    })
    expect(spy.calls()).toBe(10)

    engine.setItems([...base, ...plain(5, 10)])

    expect(spy.calls()).toBe(15)
  })

  it('does a full relayout on reorder', () => {
    const spy = heightSpy()
    const base = plain(5)
    const engine = createEngine({
      algorithm: masonry({ columns: 2 }),
      viewport: { width: 320, height: 800 },
      items: base,
      measurements: spy.options,
    })
    expect(spy.calls()).toBe(5)

    engine.setItems([...base].reverse())

    expect(spy.calls()).toBe(10)
  })

  it('prepend yields the same layout as building the full set at once', () => {
    const build = (items: LayoutItem[]) =>
      createEngine({
        algorithm: masonry({ columns: 3 }),
        gap: { x: 12, y: 12 },
        viewport: { width: 600, height: 800 },
        items,
      })
    const combined = [...squares(10), ...squaresFrom(10, 20)]

    const prepended = build(squaresFrom(10, 20))
    prepended.setItems(combined)
    const full = build(combined)

    expect(entriesOf(prepended.getSnapshot().positions)).toEqual(
      entriesOf(full.getSnapshot().positions),
    )
    expect(prepended.getSnapshot().contentSize).toEqual(full.getSnapshot().contentSize)
  })

  it('drops measurements for items removed from the list', () => {
    const base = plain(10)
    const engine = createEngine({
      algorithm: masonry({ columns: 2 }),
      viewport: { width: 320, height: 800 },
      items: base,
    })
    engine.measure(base.map((item) => ({ id: item.id, size: { width: 160, height: 120 } })))
    expect(engine.serialize().measured).toHaveLength(10)

    engine.setItems(base.slice(0, 3))

    expect(engine.serialize().measured.map(([id]) => id)).toEqual([0, 1, 2])
    expect(engine.getSnapshot().positions.rectOf(0)?.height).toBe(120)
  })

  it('never keeps more measurements than there are items', () => {
    const base = plain(20)
    const engine = createEngine({
      algorithm: masonry({ columns: 2 }),
      viewport: { width: 320, height: 800 },
      items: base,
    })
    engine.measure(base.map((item) => ({ id: item.id, size: { width: 160, height: 120 } })))

    engine.setItems(plain(20, 100))

    expect(engine.serialize().measured).toHaveLength(0)
  })

  it('relayouts when the algorithm changes', () => {
    const engine = createEngine({
      algorithm: masonry({ columns: 2 }),
      viewport: { width: 300, height: 800 },
      items: squares(4),
    })
    expect(engine.getSnapshot().positions.rectOf(1)?.x).toBe(150)

    engine.setAlgorithm(masonry({ columns: 1 }))

    expect(engine.getSnapshot().positions.rectOf(1)?.x).toBe(0)
    expect(engine.getSnapshot().positions.rectOf(1)?.y).toBe(300)
  })

  it('does not relayout when viewport or gap is unchanged', () => {
    const engine = createEngine({
      algorithm: masonry({ columns: 2 }),
      viewport: { width: 300, height: 800 },
      gap: { x: 8, y: 8 },
      items: squares(2),
    })
    const listener = vi.fn()
    engine.subscribe(listener)

    engine.setViewport({ width: 300, height: 800 })
    engine.setGap({ x: 8, y: 8 })

    expect(listener).not.toHaveBeenCalled()
  })

  it('round-trips through serialize and hydrate with identical layout', () => {
    const server = createEngine({
      algorithm: masonry({ columns: 3 }),
      gap: { x: 12, y: 12 },
      viewport: { width: 600, height: 800 },
      items: squares(30),
    })
    server.measure([{ id: 5, size: { width: 196, height: 400 } }])

    const serialized = server.serialize()
    const client = hydrateEngine(serialized, { algorithm: masonry({ columns: 3 }) })

    expect(entriesOf(client.getSnapshot().positions)).toEqual(
      entriesOf(server.getSnapshot().positions),
    )
    expect(client.getSnapshot().contentSize).toEqual(server.getSnapshot().contentSize)
  })

  it('rejects hydrating an unknown serialization version', () => {
    const server = createEngine({
      algorithm: masonry({ columns: 3 }),
      viewport: { width: 600, height: 800 },
      items: squares(10),
    })
    const serialized = { ...server.serialize(), version: 999 }

    expect(() => hydrateEngine(serialized, { algorithm: masonry({ columns: 3 }) })).toThrow(
      LaynError,
    )
    try {
      hydrateEngine(serialized, { algorithm: masonry({ columns: 3 }) })
    } catch (error) {
      expect((error as LaynError).code).toBe('SERIALIZATION_VERSION_MISMATCH')
    }
  })

  it('rejects hydrating with a different algorithm', () => {
    const server = createEngine({
      algorithm: masonry({ columns: 3 }),
      viewport: { width: 600, height: 800 },
      items: squares(10),
    })
    const justified: LayoutAlgorithm = {
      name: 'justified',
      capabilities: { incremental: false, requiresMeasuredHeight: true },
      layout: () => ({
        positions: server.getSnapshot().positions,
        contentSize: { width: 0, height: 0 },
      }),
    }

    expect(() => hydrateEngine(server.serialize(), { algorithm: justified })).toThrow(LaynError)
  })

  it('passes verification when server and client configs match', () => {
    const server = createEngine({
      algorithm: masonry({ columns: 3 }),
      gap: { x: 12, y: 12 },
      viewport: { width: 600, height: 800 },
      items: squares(30),
    })

    expect(() =>
      hydrateEngine(server.serialize(), { algorithm: masonry({ columns: 3 }), verify: true }),
    ).not.toThrow()
  })

  it('detects an option mismatch during verification', () => {
    const server = createEngine({
      algorithm: masonry({ columns: 3 }),
      gap: { x: 12, y: 12 },
      viewport: { width: 600, height: 800 },
      items: squares(30),
    })

    try {
      hydrateEngine(server.serialize(), { algorithm: masonry({ columns: 4 }), verify: true })
      throw new Error('expected a hydration mismatch')
    } catch (error) {
      expect(error).toBeInstanceOf(LaynError)
      expect((error as LaynError).code).toBe('HYDRATION_MISMATCH')
    }
  })
})
