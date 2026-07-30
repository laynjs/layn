import type { ItemId, MeasuredEntry } from '@laynjs/core'
import type { DomEnvironment, SizeObserver } from '../types/index.js'

export const createSizeObserver = (
  environment: DomEnvironment,
  onMeasure: (entries: readonly MeasuredEntry[]) => void,
): SizeObserver => {
  const idByElement = new Map<Element, ItemId>()
  const elementById = new Map<ItemId, Element>()

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
    }
  }

  return {
    observe(id, element) {
      detach(id)
      elementById.set(id, element)
      idByElement.set(element, id)
      observer.observe(element)
    },
    unobserve: detach,
    disconnect() {
      observer.disconnect()
      idByElement.clear()
      elementById.clear()
    },
  }
}
