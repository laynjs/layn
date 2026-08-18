import type { ContainerAttrs, ContentAria, ScrollMode } from '@laynjs/adapter-utils'
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
import type { Accessor, JSX } from 'solid-js'
import type { LaynElementRef, LaynItem } from './item.js'

export type MaybeAccessor<T> = T | Accessor<T>

/**
 * Options for `useLayn`. Only `items` and `algorithm` are required.
 *
 * Give each item an `aspectRatio` (or explicit dimensions) so the first render is already correctly
 * positioned, with no measure-then-jump.
 */
export interface UseLaynOptions<TData = unknown> {
  readonly items: MaybeAccessor<readonly LayoutItem<TData>[]>
  readonly algorithm: MaybeAccessor<LayoutAlgorithm>
  readonly gap?: MaybeAccessor<Gap | undefined>
  readonly viewport?: Viewport
  readonly axis?: ScrollAxis
  readonly overscan?: number
  readonly label?: string
  readonly measurements?: MeasurementsOptions
  readonly direction?: Direction
  readonly stickyHeaders?: (item: LayoutItem) => boolean
  readonly animate?: AnimateOption
  readonly onReachEnd?: () => void
  readonly reachEndThreshold?: number
  readonly onReorder?: (from: number, to: number) => void
  readonly onDragStart?: (id: ItemId) => void
  readonly onDragEnd?: (id: ItemId) => void
  readonly scroll?: ScrollMode
  readonly environment?: Partial<DomEnvironment>
}

/** What `useLayn` gives you: the container and content bindings, and the items on screen. */
export interface UseLaynResult<TData = unknown> {
  readonly containerRef: LaynElementRef
  readonly containerStyle: JSX.CSSProperties
  readonly containerAttrs: ContainerAttrs
  readonly contentAttrs: ContentAria
  readonly contentStyle: Accessor<JSX.CSSProperties>
  readonly items: Accessor<readonly LaynItem<TData>[]>
  readonly totalSize: Accessor<Size>
  readonly engine: LayoutEngine
  scrollToIndex(index: number, options?: ScrollToItemOptions): void
  scrollToItem(id: ItemId, options?: ScrollToItemOptions): void
  startDrag(id: ItemId, event: PointerEvent): void
}
