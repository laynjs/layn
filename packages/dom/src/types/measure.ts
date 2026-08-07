import type { ItemId } from '@laynjs/core'

export interface TrackedItem {
  readonly id: ItemId
  readonly element: Element
  readonly parent: Element
}

export interface SizeObserver {
  observe(id: ItemId, element: Element): void
  unobserve(id: ItemId): void
  elementOf(id: ItemId): Element | undefined
  tracked(): Iterable<TrackedItem>
  forget(): void
  disconnect(): void
}
