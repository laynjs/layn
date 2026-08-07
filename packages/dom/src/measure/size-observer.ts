import type { ItemId, MeasuredEntry } from '@laynjs/core'
import type { DomEnvironment, SizeObserver, TrackedItem } from '../types/index.js'

export const createSizeObserver = (
  environment: DomEnvironment,
  onMeasure: (entries: readonly MeasuredEntry[]) => void,
): SizeObserver => {
  const idByElement = new Map<Element, ItemId>()
  const elementById = new Map<ItemId, Element>()
  const detachedById = new Map<ItemId, Element>()
  const parentById = new Map<ItemId, Element>()

  const observer = environment.createResizeObserver((entries) => {
    const measured: MeasuredEntry[] = []
    for (const entry of entries) {
      const id = idByElement.get(entry.target)
      if (id !== undefined) {
        const { width, height } = entry.contentRect
        measured.push({ id, size: { width, height } })
      }
    }
    if (measured.length > 0) {
      onMeasure(measured)
    }
  })

  const detach = (id: ItemId): void => {
    const element = elementById.get(id)
    if (element !== undefined) {
      observer.unobserve(element)
      elementById.delete(id)
      idByElement.delete(element)
      detachedById.set(id, element)
    }
  }

  const parentOf = (id: ItemId, element: Element): Element | undefined => {
    const live = element.parentElement
    if (live === null) {
      return parentById.get(id)
    }
    parentById.set(id, live)
    return live
  }

  return {
    observe(id, element) {
      detach(id)
      detachedById.delete(id)
      elementById.set(id, element)
      idByElement.set(element, id)
      parentOf(id, element)
      observer.observe(element)
    },
    unobserve: detach,
    elementOf: (id) => elementById.get(id),
    tracked() {
      const items: TrackedItem[] = []
      for (const [id, element] of [...elementById, ...detachedById]) {
        const parent = parentOf(id, element)
        if (parent !== undefined) {
          items.push({ id, element, parent })
        }
      }
      return items
    },
    forget() {
      for (const id of detachedById.keys()) {
        parentById.delete(id)
      }
      detachedById.clear()
    },
    disconnect() {
      observer.disconnect()
      idByElement.clear()
      elementById.clear()
      detachedById.clear()
      parentById.clear()
    },
  }
}
