import type { Gap, LayoutAlgorithm, LayoutEngine, LayoutItem } from '@laynjs/core'

export interface LaynInstance<TData = unknown> {
  readonly engine: LayoutEngine
  setItems(items: readonly LayoutItem<TData>[]): void
  setAlgorithm(algorithm: LayoutAlgorithm): void
  setGap(gap: Gap): void
  refresh(): void
  destroy(): void
}
