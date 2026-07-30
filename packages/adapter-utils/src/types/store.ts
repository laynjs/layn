import type { EngineSnapshot } from '@laynjs/core'
import type { EngineBinding } from '@laynjs/dom'

export interface EngineStoreState {
  readonly snapshot: EngineSnapshot
  readonly visible: readonly number[]
}

export interface EngineStore {
  subscribe(listener: () => void): () => void
  getState(): EngineStoreState
  attach(binding: EngineBinding): void
  destroy(): void
}
