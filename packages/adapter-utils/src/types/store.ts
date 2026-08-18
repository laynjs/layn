import type { EngineSnapshot, ItemId } from '@laynjs/core'
import type { EngineBinding } from '@laynjs/dom'

export interface EngineStoreState {
  readonly snapshot: EngineSnapshot
  readonly visible: readonly number[]
}

/**
 * Bridges the eagerly created engine to the binding that only exists after mount, which is what
 * makes every adapter SSR-safe.
 *
 * It remembers observed elements and replays them on every `attach`, because frameworks attach child
 * refs before parent refs: without the replay the first screenful is never measured.
 */
export interface EngineStore {
  subscribe(listener: () => void): () => void
  getState(): EngineStoreState
  attach(binding: EngineBinding): void
  detach(): void
  observeItem(id: ItemId, element: Element): void
  unobserveItem(id: ItemId): void
  destroy(): void
}
