import type { AnimateOption, DragOptions } from '@laynjs/dom'

export interface StableBindOptions {
  readonly animate: AnimateOption | undefined
  readonly onReachEnd: (() => void) | undefined
  readonly reachEndThreshold: number | undefined
  readonly drag: DragOptions | undefined
}
