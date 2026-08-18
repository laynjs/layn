import type { ItemId } from '@laynjs/core'

/** An observed item, remembered with the parent it was rendered into so an exit clone can go back. */
export interface TrackedItem {
  readonly id: ItemId
  readonly element: Element
  readonly parent: Element
}

/** Watches item elements and reports real sizes back to the engine. */
export interface SizeObserver {
  observe(id: ItemId, element: Element): void
  unobserve(id: ItemId): void
  elementOf(id: ItemId): Element | undefined
  tracked(): Iterable<TrackedItem>
  forget(): void
  disconnect(): void
}
