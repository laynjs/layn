import type { ItemId } from '@laynjs/core'

export interface SizeObserver {
  observe(id: ItemId, element: Element): void
  unobserve(id: ItemId): void
  disconnect(): void
}
