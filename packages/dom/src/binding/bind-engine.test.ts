import { createEngine, type LayoutItem, masonry } from '@laynjs/core'
import { describe, expect, it, vi } from 'vitest'
import {
  asElement,
  asWindow,
  createControlledEnvironment,
  FakeElement,
  FakeWindow,
} from '../__fixtures__/dom.js'
import { bindEngine } from './bind-engine.js'

const squares = (count: number): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({ id: index, aspectRatio: 1 }))

const container = (width: number, height: number): FakeElement => {
  const element = new FakeElement()
  element.clientWidth = width
  element.clientHeight = height
  return element
}

describe('bindEngine', () => {
  it('applies the container size and exposes the initial visible set', () => {
    const { environment } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(20) })
    const element = container(100, 300)

    const binding = bindEngine(engine, { scroll: asElement(element), environment })

    expect(engine.getSnapshot().viewport).toEqual({ width: 100, height: 300 })
    expect(binding.getVisible()).toEqual([0, 1, 2])
  })

  it('ignores a zero-size container and keeps the current viewport', () => {
    const { environment } = createControlledEnvironment()
    const engine = createEngine({
      algorithm: masonry({ columns: 1 }),
      items: squares(20),
      viewport: { width: 200, height: 400 },
    })
    const element = container(0, 0)

    bindEngine(engine, { scroll: asElement(element), environment })

    expect(engine.getSnapshot().viewport).toEqual({ width: 200, height: 400 })
  })

  it('recomputes the visible set on scroll and notifies subscribers', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(20) })
    const element = container(100, 300)
    const binding = bindEngine(engine, { scroll: asElement(element), environment })
    const listener = vi.fn()
    binding.subscribe(listener)

    element.scrollTop = 500
    element.emit('scroll')
    flushRaf()

    expect(binding.getVisible()).toEqual([5, 6, 7])
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('clamps a stale scroll position to the new content when a layout change shrinks it', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(20) })
    const element = container(100, 300)
    const binding = bindEngine(engine, { scroll: asElement(element), environment })

    element.scrollTop = 500
    element.emit('scroll')
    flushRaf()
    expect(binding.getVisible()).toEqual([5, 6, 7])

    engine.setItems(squares(3))

    expect(binding.getVisible()).toEqual([0, 1, 2])
  })

  it('feeds measured sizes back into the engine layout', () => {
    const { environment, observers } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(20) })
    const element = container(100, 300)
    const binding = bindEngine(engine, { scroll: asElement(element), environment })

    const itemElement = new FakeElement() as unknown as Element
    binding.observeItem(0, itemElement)
    observers[0]?.trigger([{ target: itemElement, contentRect: { width: 100, height: 300 } }])

    expect(engine.getSnapshot().positions.rectOf(0)?.height).toBe(300)
    expect(binding.getVisible()).toEqual([0])
  })

  it('offsets a window scroll by the origin element document position', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(20) })
    const win = new FakeWindow()
    win.innerWidth = 100
    win.innerHeight = 300
    const origin = new FakeElement()
    origin.rect = { top: 500, left: 0, width: 100, height: 0 }

    const binding = bindEngine(engine, {
      scroll: asWindow(win),
      origin: origin as unknown as HTMLElement,
      environment,
    })

    expect(engine.getSnapshot().viewport).toEqual({ width: 100, height: 300 })
    expect(binding.getVisible()).toEqual([])

    win.scrollY = 500
    win.emit('scroll')
    flushRaf()
    expect(binding.getVisible()).toEqual([0, 1, 2])

    win.scrollY = 800
    win.emit('scroll')
    flushRaf()
    expect(binding.getVisible()).toEqual([3, 4, 5])
  })

  it('reapplies the viewport when the window resizes', () => {
    const { environment } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(20) })
    const win = new FakeWindow()
    win.innerWidth = 100
    win.innerHeight = 300

    const binding = bindEngine(engine, { scroll: asWindow(win), environment })
    expect(binding.getVisible()).toEqual([0, 1, 2])

    win.innerHeight = 600
    win.emit('resize')

    expect(engine.getSnapshot().viewport).toEqual({ width: 100, height: 600 })
    expect(binding.getVisible()).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('stops reacting after destroy', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(20) })
    const element = container(100, 300)
    const binding = bindEngine(engine, { scroll: asElement(element), environment })
    const listener = vi.fn()
    binding.subscribe(listener)

    binding.destroy()
    element.scrollTop = 500
    element.emit('scroll')
    flushRaf()

    expect(listener).not.toHaveBeenCalled()
  })
})
