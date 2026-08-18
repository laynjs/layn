import type { ItemId, LayoutItem, ScrollAxis } from '@laynjs/core'
import type { DragOptions } from './dnd.js'
import type { DomEnvironment } from './environment.js'
import type { ScrollTarget } from './target.js'
import type { AnimateOption } from './transitions.js'

/** Everything `bindEngine` needs to connect an engine to a real scroll container. */
export interface BindOptions {
  /** The element (or `window`) whose scrolling drives the visible set. */
  readonly scroll: ScrollTarget
  /** The element whose size defines the layout box. Defaults to the scroll element. */
  readonly viewport?: HTMLElement
  /** The content element, when scrolling the window: its page offset is subtracted from scroll. */
  readonly origin?: HTMLElement
  readonly axis?: ScrollAxis
  /** Pixels rendered beyond each edge of the viewport. */
  readonly overscan?: number
  /** `true` for the defaults, or `{ duration, easing }`. Animates layout changes, enters and exits. */
  readonly animate?: AnimateOption
  /**
   * Called when the scroll position comes within `reachEndThreshold` of the end.
   *
   * Latched against the content size: it fires once and not again until the content actually grows,
   * so a slow or failed fetch cannot burst, and running out of data ends the loop. You need no
   * guard flag of your own. Always fires on the next frame, never inside a layout commit.
   */
  readonly onReachEnd?: () => void
  readonly reachEndThreshold?: number
  /** Enables drag to reorder. You still own the data; layn reports the move. */
  readonly drag?: DragOptions
  /**
   * Pins the current section header while its section is on screen. Returns true for header items.
   *
   * Implemented by writing the CSS `translate` property, because `position: sticky` cannot work on
   * absolutely positioned items, and the pinned header is kept in the visible set so virtualization
   * does not unmount it.
   */
  readonly stickyHeaders?: (item: LayoutItem) => boolean
  /** Inject browser primitives, which is what makes the binding testable outside a browser. */
  readonly environment?: Partial<DomEnvironment>
}

/** Where a scrolled-to item lands in the viewport. */
export type ScrollAlign = 'start' | 'center' | 'end'

export interface ScrollToItemOptions {
  readonly align?: ScrollAlign
  readonly behavior?: ScrollBehavior
}

/** The live connection between an engine and the DOM, returned by `bindEngine`. */
export interface EngineBinding {
  /**
   * Start measuring an element. Apply the item's rect style *before* calling this: an unstyled
   * element reports a collapsed size, and that size is what gets cached.
   */
  observeItem(id: ItemId, element: Element): void
  unobserveItem(id: ItemId): void
  /** Indices of the items currently in view, including the overscan band. */
  getVisible(): readonly number[]
  subscribe(listener: () => void): () => void
  scrollToIndex(index: number, options?: ScrollToItemOptions): void
  scrollToItem(id: ItemId, options?: ScrollToItemOptions): void
  /** Begin a drag from a pointerdown event. Call it from your own handler on the tile or a grip. */
  startDrag(id: ItemId, event: PointerEvent): void
  /** Re-read the container size and scroll offset. */
  refresh(): void
  destroy(): void
}
