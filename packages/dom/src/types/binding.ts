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
  readonly environment?: Partial<DomEnvironment>
}

export interface EngineBinding {
  observeItem(id: ItemId, element: Element): void
  unobserveItem(id: ItemId): void
  getVisible(): readonly number[]
  subscribe(listener: () => void): () => void
  refresh(): void
  destroy(): void
}
