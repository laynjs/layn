import type { ItemId, ScrollAxis } from '@laynjs/core'
import type { DomEnvironment } from './environment.js'
import type { ScrollTarget } from './target.js'
import type { AnimateOption } from './transitions.js'

export interface BindOptions {
  readonly scroll: ScrollTarget
  readonly viewport?: HTMLElement
  readonly origin?: HTMLElement
  readonly axis?: ScrollAxis
  readonly overscan?: number
  readonly animate?: AnimateOption
  readonly onReachEnd?: () => void
  readonly reachEndThreshold?: number
  readonly environment?: Partial<DomEnvironment>
}

export type ScrollAlign = 'start' | 'center' | 'end'

export interface ScrollToItemOptions {
  readonly align?: ScrollAlign
  readonly behavior?: ScrollBehavior
}

export interface EngineBinding {
  observeItem(id: ItemId, element: Element): void
  unobserveItem(id: ItemId): void
  getVisible(): readonly number[]
  subscribe(listener: () => void): () => void
  scrollToIndex(index: number, options?: ScrollToItemOptions): void
  scrollToItem(id: ItemId, options?: ScrollToItemOptions): void
  refresh(): void
  destroy(): void
}
