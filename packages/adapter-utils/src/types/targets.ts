import type { ScrollTarget } from '@laynjs/dom'

export type ScrollMode = 'container' | 'window'

export interface BindTargets {
  readonly scroll: ScrollTarget
  readonly origin?: HTMLElement
}
