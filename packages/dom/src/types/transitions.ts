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

export interface TransitionRunner {
  play(
    previous: Positions,
    next: Positions,
    elementOf: (id: ItemId) => Element | undefined,
    visible: readonly number[],
  ): void
  stop(): void
}
