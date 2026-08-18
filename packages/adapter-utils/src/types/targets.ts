import type { ScrollTarget } from '@laynjs/dom'

/** `'container'` scrolls the grid element itself; `'window'` scrolls the page. */
export type ScrollMode = 'container' | 'window'

export interface BindTargets {
  readonly scroll: ScrollTarget
  readonly origin?: HTMLElement
}
