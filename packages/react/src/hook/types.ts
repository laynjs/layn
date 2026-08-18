import type { ScrollMode } from '@laynjs/adapter-utils'
import type { LayoutItem, ScrollAxis } from '@laynjs/core'
import type { AnimateOption, DomEnvironment, DragOptions } from '@laynjs/dom'

export interface StableBindOptions {
  readonly animate: AnimateOption | undefined
  readonly onReachEnd: (() => void) | undefined
  readonly reachEndThreshold: number | undefined
  readonly drag: DragOptions | undefined
  readonly stickyHeaders: ((item: LayoutItem) => boolean) | undefined
}

export interface ContainerRefSetup extends StableBindOptions {
  readonly axis: ScrollAxis
  readonly overscan: number
  readonly scroll: ScrollMode | undefined
  readonly environment: Partial<DomEnvironment> | undefined
}
