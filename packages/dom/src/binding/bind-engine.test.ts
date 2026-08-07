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

  it('animates observed items across a layout change when animate is enabled', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const engine = createEngine({
      algorithm: masonry({ columns: 1 }),
      items: squares(20),
      viewport: { width: 100, height: 300 },
    })
    const element = container(100, 300)
    const binding = bindEngine(engine, { scroll: asElement(element), environment, animate: true })
    const item = new FakeElement()
    binding.observeItem(1, item as unknown as Element)

    engine.setGap({ x: 0, y: 10 })
    flushRaf()

    expect(item.animations[0]?.keyframes).toEqual([
      { transform: 'translate(0px, -10px)' },
      { transform: 'translate(0px, 0px)' },
    ])
  })

  it('fades in items that are appended to the data', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const engine = createEngine({
      algorithm: masonry({ columns: 1 }),
      items: squares(2),
      viewport: { width: 100, height: 300 },
    })
    const element = container(100, 300)
    const binding = bindEngine(engine, { scroll: asElement(element), environment, animate: true })

    engine.appendItems([{ id: 2, aspectRatio: 1 }])
    const added = new FakeElement()
    binding.observeItem(2, added as unknown as Element)
    flushRaf()

    expect(added.animations).toHaveLength(2)
    expect(added.animations[1]?.keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }])
  })

  it('does not animate the initial viewport commit of the binding', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(20) })
    const element = container(100, 300)
    const binding = bindEngine(engine, { scroll: asElement(element), environment, animate: true })
    const item = new FakeElement()
    binding.observeItem(1, item as unknown as Element)

    flushRaf()

    expect(item.animations).toHaveLength(0)
  })

  it('cancels running animations on destroy', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const engine = createEngine({
      algorithm: masonry({ columns: 1 }),
      items: squares(20),
      viewport: { width: 100, height: 300 },
    })
    const element = container(100, 300)
    const binding = bindEngine(engine, { scroll: asElement(element), environment, animate: true })
    const item = new FakeElement()
    binding.observeItem(1, item as unknown as Element)

    engine.setGap({ x: 0, y: 10 })
    flushRaf()
    binding.destroy()

    expect(item.animations[0]?.canceled).toBe(true)
  })

  it('scrolls the container to an item by index and by id', () => {
    const { environment } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(20) })
    const element = container(100, 300)
    const binding = bindEngine(engine, { scroll: asElement(element), environment })

    binding.scrollToIndex(5)
    expect(element.lastScrollTo).toEqual({ top: 500 })

    binding.scrollToIndex(5, { align: 'center', behavior: 'smooth' })
    expect(element.lastScrollTo).toEqual({ top: 400, behavior: 'smooth' })

    binding.scrollToItem(7, { align: 'end' })
    expect(element.lastScrollTo).toEqual({ top: 500 })

    element.lastScrollTo = undefined
    binding.scrollToIndex(99)
    binding.scrollToItem('missing')
    expect(element.lastScrollTo).toBeUndefined()
  })

  it('scrolls the window to an item offset by the origin element', () => {
    const { environment } = createControlledEnvironment()
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

    binding.scrollToIndex(3)
    expect(win.lastScrollTo).toEqual({ top: 800 })
  })

  it('does not signal the end while the scroll position is far from it', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(20) })
    const element = container(100, 300)
    const onReachEnd = vi.fn()

    bindEngine(engine, { scroll: asElement(element), onReachEnd, environment })
    flushRaf()

    expect(onReachEnd).not.toHaveBeenCalled()
  })

  it('signals the end once the scroll position enters the threshold', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(20) })
    const element = container(100, 300)
    const onReachEnd = vi.fn()
    bindEngine(engine, { scroll: asElement(element), onReachEnd, environment })
    const extent = engine.getSnapshot().contentSize.height

    element.scrollTop = extent - 600
    element.emit('scroll')
    flushRaf()
    expect(onReachEnd).not.toHaveBeenCalled()

    element.scrollTop = extent - 400
    element.emit('scroll')
    flushRaf()
    expect(onReachEnd).toHaveBeenCalledTimes(1)
  })

  it('signals the end only once per content extent', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(20) })
    const element = container(100, 300)
    const onReachEnd = vi.fn()
    bindEngine(engine, { scroll: asElement(element), onReachEnd, environment })

    const extent = engine.getSnapshot().contentSize.height
    element.scrollTop = extent
    element.emit('scroll')
    flushRaf()
    element.scrollTop = extent - 50
    element.emit('scroll')
    flushRaf()

    expect(onReachEnd).toHaveBeenCalledTimes(1)
  })

  it('signals the end again once appended items grow the content', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(20) })
    const element = container(100, 300)
    const onReachEnd = vi.fn()
    bindEngine(engine, { scroll: asElement(element), onReachEnd, environment })

    element.scrollTop = engine.getSnapshot().contentSize.height
    element.emit('scroll')
    flushRaf()
    expect(onReachEnd).toHaveBeenCalledTimes(1)

    engine.appendItems([{ id: 100, aspectRatio: 1 }])
    flushRaf()

    expect(onReachEnd).toHaveBeenCalledTimes(2)
  })

  it('signals the end on a later frame when the content does not fill the viewport', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(1) })
    const element = container(100, 300)
    const onReachEnd = vi.fn()

    bindEngine(engine, { scroll: asElement(element), onReachEnd, environment })
    expect(onReachEnd).not.toHaveBeenCalled()

    flushRaf()
    expect(onReachEnd).toHaveBeenCalledTimes(1)
  })

  it('honours a custom reach-end threshold', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(20) })
    const element = container(100, 300)
    const onReachEnd = vi.fn()
    bindEngine(engine, {
      scroll: asElement(element),
      onReachEnd,
      reachEndThreshold: 0,
      environment,
    })

    const extent = engine.getSnapshot().contentSize.height
    element.scrollTop = extent - 350
    element.emit('scroll')
    flushRaf()
    expect(onReachEnd).not.toHaveBeenCalled()

    element.scrollTop = extent
    element.emit('scroll')
    flushRaf()
    expect(onReachEnd).toHaveBeenCalledTimes(1)
  })

  it('drops a pending end signal on destroy', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const engine = createEngine({ algorithm: masonry({ columns: 1 }), items: squares(1) })
    const element = container(100, 300)
    const onReachEnd = vi.fn()
    const binding = bindEngine(engine, { scroll: asElement(element), onReachEnd, environment })

    binding.destroy()
    flushRaf()

    expect(onReachEnd).not.toHaveBeenCalled()
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
