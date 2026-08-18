import type { ItemAria } from '@laynjs/adapter-utils'
import type { ItemId, LayoutItem } from '@laynjs/core'
import type { CSSProperties } from 'react'

/** One rendered item. Spread `style` first, then your own visual styles. */
export interface LaynItem<TData = unknown> {
  readonly id: ItemId
  readonly index: number
  readonly item: LayoutItem<TData>
  /** Position and size. layn owns `position`, `top`, `left`, `width`, `height` and `transform`. */
  readonly style: CSSProperties
  /** `role` plus `aria-setsize`/`aria-posinset`, so screen readers announce the full count. */
  readonly a11y: ItemAria
  /**
   * Attach to a plain wrapper element, never directly to an `<img>`, `<video>` or `<iframe>`: a
   * replaced element reports a collapsed size before its resource loads, and that size is cached.
   */
  readonly ref: (element: HTMLElement | null) => void
}
