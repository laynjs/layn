import { createEngine, type LayoutItem, masonry } from '@laynjs/core'
import type { EngineBinding } from '@laynjs/dom'
import { describe, expect, it, vi } from 'vitest'
import { createStore } from './store.js'

const squares = (count: number): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({ id: index, aspectRatio: 1 }))

const fakeBinding = () => {
  let visible: readonly number[] = []
  const listeners = new Set<() => void>()
  const binding: EngineBinding = {
    observeItem: () => undefined,
    unobserveItem: () => undefined,
    getVisible: () => visible,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    scrollToIndex: () => undefined,
    scrollToItem: () => undefined,
    refresh: () => undefined,
    destroy: () => undefined,
  }
  return {
    binding,
    setVisible: (next: readonly number[]) => {
      visible = next
      for (const listener of listeners) {
        listener()
      }
    },
  }
}

describe('store', () => {
  it('derives the initial visible set from the engine viewport', () => {
    const engine = createEngine({
      algorithm: masonry({ columns: 1 }),
      viewport: { width: 100, height: 300 },
      items: squares(20),
    })

    expect(createStore(engine, 'vertical', 0).getState().visible).toEqual([0, 1, 2])
  })

  it('updates and notifies on engine changes', () => {
    const engine = createEngine({
      algorithm: masonry({ columns: 1 }),
      viewport: { width: 100, height: 300 },
      items: squares(20),
    })
    const store = createStore(engine, 'vertical', 0)
    const listener = vi.fn()
    store.subscribe(listener)

    engine.setViewport({ width: 100, height: 600 })

    expect(listener).toHaveBeenCalled()
    expect(store.getState().visible).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('reads the visible set from the binding after attach', () => {
    const engine = createEngine({
      algorithm: masonry({ columns: 1 }),
      viewport: { width: 100, height: 300 },
      items: squares(20),
    })
    const store = createStore(engine, 'vertical', 0)
    const fake = fakeBinding()

    store.attach(fake.binding)
    fake.setVisible([7, 8, 9])

    expect(store.getState().visible).toEqual([7, 8, 9])
  })
})
