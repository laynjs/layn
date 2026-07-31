import type { ItemId, Positions } from '@laynjs/core'

export interface TransitionBatch {
  readonly previous: Positions
  readonly next: Positions
  readonly elementOf: (id: ItemId) => Element | undefined
  readonly visible: readonly number[]
}

export interface TransitionMove {
  readonly id: ItemId
  readonly element: Element
  readonly dx: number
  readonly dy: number
}
