import type { LayoutAlgorithm } from './algorithm.js'
import type { Gap, ItemId, Size, Viewport } from './common.js'
import type { LayoutItem } from './item.js'
import type { MeasuredEntry, MeasurementsOptions } from './measurement.js'
import type { Positions, SerializedPositions } from './positions.js'
import type { ScrollWindow, VisibleOptions } from './virtualization.js'

export interface EngineConfig {
  readonly algorithm: LayoutAlgorithm
  readonly gap?: Gap
  readonly viewport?: Viewport
  readonly items?: readonly LayoutItem[]
  readonly measurements?: MeasurementsOptions
  readonly measured?: ReadonlyArray<readonly [ItemId, Size]>
}

export interface EngineSnapshot {
  readonly version: number
  readonly positions: Positions
  readonly contentSize: Size
  readonly viewport: Viewport
  readonly items: readonly LayoutItem[]
}

export interface LayoutEngine {
  getSnapshot(): EngineSnapshot
  subscribe(listener: () => void): () => void
  setItems(items: readonly LayoutItem[]): void
  appendItems(items: readonly LayoutItem[]): void
  setViewport(viewport: Viewport): void
  setGap(gap: Gap): void
  setAlgorithm(algorithm: LayoutAlgorithm): void
  measure(entries: readonly MeasuredEntry[]): void
  getVisible(window: ScrollWindow, options?: VisibleOptions): readonly number[]
  serialize(): SerializedLayout
  destroy(): void
}

export interface SerializedLayout {
  readonly version: number
  readonly algorithm: string
  readonly gap: Gap
  readonly viewport: Viewport
  readonly items: readonly LayoutItem[]
  readonly measured: ReadonlyArray<readonly [ItemId, Size]>
  readonly positions: SerializedPositions
  readonly contentSize: Size
}

export interface HydrateOptions {
  readonly algorithm: LayoutAlgorithm
  readonly measurements?: MeasurementsOptions
  readonly verify?: boolean
}
