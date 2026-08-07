import type { ItemId, LayoutEngine, ScrollAxis } from '@laynjs/core'
import type { EngineBinding } from '@laynjs/dom'
import type { EngineStore, EngineStoreState } from '../types/index.js'

const noop = (): void => undefined

export const createStore = (
  engine: LayoutEngine,
  axis: ScrollAxis,
  overscan: number,
): EngineStore => {
  let binding: EngineBinding | undefined
  const listeners = new Set<() => void>()
  const pending = new Map<ItemId, Element>()

  const readVisible = (): readonly number[] => {
    if (binding !== undefined) {
      return binding.getVisible()
    }
    const { viewport } = engine.getSnapshot()
    const size = axis === 'vertical' ? viewport.height : viewport.width
    return engine.getVisible({ start: 0, size }, { axis, overscan })
  }

  let state: EngineStoreState = { snapshot: engine.getSnapshot(), visible: readVisible() }

  const update = (): void => {
    state = { snapshot: engine.getSnapshot(), visible: readVisible() }
    for (const listener of listeners) {
      listener()
    }
  }

  let unsubscribeEngine = engine.subscribe(update)
  let unsubscribeBinding = noop

  return {
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getState: () => state,
    attach(next) {
      unsubscribeEngine()
      unsubscribeEngine = noop
      binding = next
      for (const [id, element] of pending) {
        next.observeItem(id, element)
      }
      pending.clear()
      unsubscribeBinding = next.subscribe(update)
      update()
    },
    observeItem(id, element) {
      if (binding === undefined) {
        pending.set(id, element)
        return
      }
      binding.observeItem(id, element)
    },
    unobserveItem(id) {
      pending.delete(id)
      binding?.unobserveItem(id)
    },
    destroy() {
      pending.clear()
      unsubscribeEngine()
      unsubscribeBinding()
      listeners.clear()
    },
  }
}
