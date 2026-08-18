import type { ItemId, Positions } from '@laynjs/core'

/** Timing for the animation layer. */
export interface TransitionOptions {
  readonly duration?: number
  readonly easing?: string
}

/** `true` to animate with the defaults, an object to tune the timing, or omit to stay static. */
export type AnimateOption = boolean | TransitionOptions

export interface TransitionConfig {
  readonly duration: number
  readonly easing: string
}

export interface TransformOffset {
  readonly x: number
  readonly y: number
}

/**
 * An item that has left the data. Frameworks unmount the element before the engine ever hears about
 * the removal, so the exit animation runs on a re-inserted, inert clone: `aria-hidden`, no pointer
 * events, no `role` or `data-layn-id`, so assistive technology never counts it.
 */
export interface ExitCandidate {
  readonly id: ItemId
  readonly element: Element
  readonly parent: Element
}

/** One layout change to animate: where every item was, and where it now is. */
export interface TransitionCommit {
  readonly previous: Positions
  readonly next: Positions
  readonly elementOf: (id: ItemId) => Element | undefined
  readonly leaving: Iterable<ExitCandidate>
  readonly visible: readonly number[]
  /** An item to leave alone, such as the tile currently being dragged. */
  readonly skip?: ItemId
}

export interface TransitionRunner {
  play(commit: TransitionCommit): void
  stop(): void
}
