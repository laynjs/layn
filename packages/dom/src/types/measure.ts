import type { ItemId } from '@laynjs/core'

export interface SizeObserver {
  observe(id: ItemId, element: Element): void
  unobserve(id: ItemId): void
  elementOf(id: ItemId): Element | undefined
  disconnect(): void
}
