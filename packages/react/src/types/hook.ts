import type { ContainerAria, ContentAria, ScrollMode } from '@laynjs/adapter-utils'
import type {
  Direction,
  Gap,
  ItemId,
  LayoutAlgorithm,
  LayoutEngine,
  LayoutItem,
  MeasurementsOptions,
  ScrollAxis,
  Size,
  Viewport,
} from '@laynjs/core'
import type { AnimateOption, DomEnvironment, ScrollToItemOptions } from '@laynjs/dom'
import type { CSSProperties } from 'react'
import type { LaynItem } from './item.js'

/**
 * Options for `useLayn`. Only `items` and `algorithm` are required.
 *
 * Give each item an `aspectRatio` (or explicit dimensions) so the first render, on the server or the
 * client, is already correctly positioned.
 */
export interface UseLaynOptions<TData = unknown> {
  readonly items: readonly LayoutItem<TData>[]
  /** For example `masonry({ columns: { 0: 2, 900: 4 } })`. */
  readonly algorithm: LayoutAlgorithm
  readonly gap?: Gap
  /** Only needed on the server, where there is no container to measure. */
  readonly viewport?: Viewport
  readonly axis?: ScrollAxis
  /** Pixels rendered beyond each edge of the viewport. */
  readonly overscan?: number
  /** Labels the scroll region for assistive technology and makes it focusable. */
  readonly label?: string
  /** `true` to animate layout changes, enters and exits, or an object to tune the timing. */
  readonly animate?: AnimateOption
  /** `'container'` (the default) scrolls the grid itself; `'window'` scrolls the page. */
  readonly scroll?: ScrollMode
  /**
   * Load the next page. Latched against the content size, so it fires once and not again until the
   * content grows: no guard flag needed on your side, and no burst if the fetch is slow or fails.
   */
  readonly onReachEnd?: () => void
  readonly reachEndThreshold?: number
  /** Fires during a drag, every time the held item crosses another. Apply the move to your array. */
  readonly onReorder?: (from: number, to: number) => void
  readonly onDragStart?: (id: ItemId) => void
  readonly onDragEnd?: (id: ItemId) => void
  readonly measurements?: MeasurementsOptions
  /** `'rtl'` mirrors the layout in the engine. Create-time only. */
  readonly direction?: Direction
  /** Pins the current section's header. Returns true for header items. See `sections`. */
  readonly stickyHeaders?: (item: LayoutItem) => boolean
  readonly environment?: Partial<DomEnvironment>
}

/** What `useLayn` gives you. Spread the props, render the items. */
export interface UseLaynResult<TData = unknown> {
  /** Spread onto the scroll element. You still have to give it a height in your own CSS. */
  readonly containerProps: ContainerAria & {
    readonly ref: (element: HTMLElement | null) => void
    readonly style: CSSProperties
    readonly tabIndex: number
  }
  /** Spread onto a single wrapper inside the container. It carries the full content size. */
  readonly contentProps: ContentAria & {
    readonly style: CSSProperties
  }
  /** Only the items currently on screen, already positioned. */
  readonly items: readonly LaynItem<TData>[]
  /** The size of the whole laid-out content, visible items or not. */
  readonly totalSize: Size
  /** The underlying engine, for `serialize`, `isMeasured`, or the devtools overlay. */
  readonly engine: LayoutEngine
  scrollToIndex(index: number, options?: ScrollToItemOptions): void
  scrollToItem(id: ItemId, options?: ScrollToItemOptions): void
  /** Begin a drag. Call it from `onPointerDown` on the tile or a drag handle. */
  startDrag(id: ItemId, event: PointerEvent): void
}
