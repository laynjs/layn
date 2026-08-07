import type { Gap, ItemId, LayoutAlgorithm, LayoutEngine, LayoutItem } from '@laynjs/core'
import type { ScrollToItemOptions } from '@laynjs/dom'

export interface LaynInstance<TData = unknown> {
  readonly engine: LayoutEngine
  setItems(items: readonly LayoutItem<TData>[]): void
  setAlgorithm(algorithm: LayoutAlgorithm): void
  setGap(gap: Gap): void
  scrollToIndex(index: number, options?: ScrollToItemOptions): void
  scrollToItem(id: ItemId, options?: ScrollToItemOptions): void
  startDrag(id: ItemId, event: PointerEvent): void
  refresh(): void
  destroy(): void
}
