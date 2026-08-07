import type { ItemId, Positions } from '@laynjs/core'
import type { ExitCandidate } from '../types/index.js'

export interface ExitRunner {
  capture(next: Positions, leaving: Iterable<ExitCandidate>): void
  stop(): void
}

export interface TransitionMove {
  readonly id: ItemId
  readonly element: Element
  readonly dx: number
  readonly dy: number
}

export interface TransitionEnter {
  readonly id: ItemId
  readonly element: Element
}

export interface TransitionPlan {
  readonly moves: readonly TransitionMove[]
  readonly enters: readonly TransitionEnter[]
}
