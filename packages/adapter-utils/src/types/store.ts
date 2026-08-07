import type { EngineSnapshot, ItemId } from '@laynjs/core'
import type { EngineBinding } from '@laynjs/dom'

export interface EngineStoreState {
  readonly snapshot: EngineSnapshot
  readonly visible: readonly number[]
}

export interface EngineStore {
  subscribe(listener: () => void): () => void
  getState(): EngineStoreState
  attach(binding: EngineBinding): void
  observeItem(id: ItemId, element: Element): void
  unobserveItem(id: ItemId): void
  destroy(): void
}
