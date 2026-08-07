import {
  createEngine,
  type ItemId,
  type LayoutEngine,
  type LayoutItem,
  masonry,
} from '@laynjs/core'
import { describe, expect, it, vi } from 'vitest'
import { createControlledEnvironment, FakeElement, fakeDocument } from '../__fixtures__/dom.js'
import { DRAGGING_ATTR } from '../constants.js'
import type { DragOptions } from '../types/index.js'
import { createDragController } from './drag.js'

const squares = (count: number): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({ id: index, aspectRatio: 1 }))

const move = (items: readonly LayoutItem[], from: number, to: number): LayoutItem[] => {
  const next = [...items]
  const [moved] = next.splice(from, 1)
  if (moved !== undefined) {
    next.splice(to, 0, moved)
  }
  return next
}

const pointer = (x: number, y: number) => ({ pointerId: 1, clientX: x, clientY: y }) as PointerEvent

const setupDrag = (options: DragOptions, count = 5) => {
  const { environment, flushRaf } = createControlledEnvironment()
  const engine: LayoutEngine = createEngine({
    algorithm: masonry({ columns: 1 }),
    items: squares(count),
    gap: { x: 0, y: 0 },
    viewport: { width: 100, height: 500 },
  })
  const parent = new FakeElement()
  const elements = Array.from({ length: count }, () => {
    const element = new FakeElement()
    parent.appendChild(element)
    return element
  })
  const controller = createDragController({
    engine,
    environment,
    elementOf: (id: ItemId) => elements[id as number] as unknown as Element | undefined,
    visibleOf: () => Array.from({ length: count }, (_, index) => index),
    settle: undefined,
    options,
  })
  return { controller, engine, elements, parent, flushRaf }
}

describe('createDragController', () => {
  it('is absent when no reorder handler is given', () => {
    expect(setupDrag({}).controller).toBeUndefined()
  })

  it('marks the dragged element and captures the pointer', () => {
    const { controller, elements } = setupDrag({ onReorder: vi.fn() })

    controller?.start(1, pointer(50, 150))

    expect(elements[1]?.attributes.has(DRAGGING_ATTR)).toBe(true)
    expect(elements[1]?.captured).toBe(true)
    expect(elements[1]?.style.zIndex).toBe('1')
  })

  it('translates the dragged element to follow the pointer', () => {
    const { controller, elements, flushRaf } = setupDrag({ onReorder: vi.fn() })
    controller?.start(1, pointer(50, 150))

    elements[1]?.emit('pointermove', pointer(70, 190))
    flushRaf()

    expect(elements[1]?.style.translate).toBe('20px 40px')
  })

  it('reports a reorder when the pointer enters another item', () => {
    const onReorder = vi.fn()
    const { controller, elements, flushRaf } = setupDrag({ onReorder })
    controller?.start(1, pointer(50, 150))

    elements[1]?.emit('pointermove', pointer(50, 350))
    flushRaf()

    expect(onReorder).toHaveBeenCalledWith(1, 3)
  })

  it('does not report the same target twice', () => {
    const onReorder = vi.fn()
    const { controller, elements, flushRaf } = setupDrag({ onReorder })
    controller?.start(1, pointer(50, 150))

    elements[1]?.emit('pointermove', pointer(50, 350))
    flushRaf()
    elements[1]?.emit('pointermove', pointer(50, 360))
    flushRaf()

    expect(onReorder).toHaveBeenCalledTimes(1)
  })

  it('keeps the dragged element under the pointer after the layout reflows', () => {
    let items = squares(5)
    const onReorder = (from: number, to: number): void => {
      items = move(items, from, to)
      engine.setItems(items)
    }
    const { controller, engine, elements, flushRaf } = setupDrag({ onReorder })
    controller?.start(1, pointer(50, 150))

    elements[1]?.emit('pointermove', pointer(50, 350))
    flushRaf()
    controller?.sync()

    expect(engine.getSnapshot().positions.indexOf(1)).toBe(3)
    const rect = engine.getSnapshot().positions.rectOf(1)
    const offsetY = Number(elements[1]?.style.translate?.split(' ')[1]?.replace('px', ''))
    expect((rect?.y ?? 0) + offsetY).toBe(300)
  })

  it('restores the original order when the drag is cancelled with Escape', () => {
    let items = squares(5)
    const onReorder = (from: number, to: number): void => {
      items = move(items, from, to)
      engine.setItems(items)
    }
    const { controller, engine, elements, flushRaf } = setupDrag({ onReorder })
    controller?.start(1, pointer(50, 150))
    elements[1]?.emit('pointermove', pointer(50, 350))
    flushRaf()
    expect(engine.getSnapshot().positions.indexOf(1)).toBe(3)

    fakeDocument.emit('keydown', { key: 'Escape' })

    expect(engine.getSnapshot().positions.indexOf(1)).toBe(1)
    expect(elements[1]?.style.translate).toBe('')
    expect(elements[1]?.attributes.has(DRAGGING_ATTR)).toBe(false)
  })

  it('clears the drag state on pointerup', () => {
    const onDragEnd = vi.fn()
    const { controller, elements } = setupDrag({ onReorder: vi.fn(), onDragEnd })
    controller?.start(2, pointer(50, 250))

    elements[2]?.emit('pointerup')

    expect(controller?.activeId()).toBeUndefined()
    expect(elements[2]?.captured).toBe(false)
    expect(elements[2]?.style.zIndex).toBe('')
    expect(onDragEnd).toHaveBeenCalledWith(2)
  })
})
