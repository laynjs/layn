import type { ItemId, Positions } from '@laynjs/core'

export interface TransitionOptions {
  readonly duration?: number
  readonly easing?: string
}

export type AnimateOption = boolean | TransitionOptions

export interface TransitionConfig {
  readonly duration: number
  readonly easing: string
}

export interface TransformOffset {
  readonly x: number
  readonly y: number
}

export interface ExitCandidate {
  readonly id: ItemId
  readonly element: Element
  readonly parent: Element
}

export interface TransitionCommit {
  readonly previous: Positions
  readonly next: Positions
  readonly elementOf: (id: ItemId) => Element | undefined
  readonly leaving: Iterable<ExitCandidate>
  readonly visible: readonly number[]
  readonly skip?: ItemId
}

export interface TransitionRunner {
  play(commit: TransitionCommit): void
  stop(): void
}
