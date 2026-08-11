import type { LayoutItem } from '@laynjs/core'
import type { AnimateOption, DragOptions } from '@laynjs/dom'

export interface StableBindOptions {
  readonly animate: AnimateOption | undefined
  readonly onReachEnd: (() => void) | undefined
  readonly reachEndThreshold: number | undefined
  readonly drag: DragOptions | undefined
  readonly stickyHeaders: ((item: LayoutItem) => boolean) | undefined
}
