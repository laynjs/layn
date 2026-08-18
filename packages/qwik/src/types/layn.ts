import type { QRL, Signal } from '@builder.io/qwik'
import type { ContainerAttrs, ContentAria, ScrollMode } from '@laynjs/adapter-utils'
import type {
  Direction,
  Gap,
  ItemId,
  LayoutAlgorithm,
  LayoutItem,
  MeasurementsOptions,
  ScrollAxis,
  Size,
  Viewport,
} from '@laynjs/core'
import type { DomEnvironment, ScrollToItemOptions } from '@laynjs/dom'
import type { LaynItem } from './item.js'

/**
 * Options for `useLayn`. Only `items` and `algorithm` are required.
 *
 * Give each item an `aspectRatio` (or explicit dimensions) so the first render is already correctly
 * positioned, with no measure-then-jump.
 */
export interface UseLaynOptions<TData = unknown> {
  readonly items: readonly LayoutItem<TData>[]
  readonly algorithm: LayoutAlgorithm
  readonly gap?: Gap
  readonly viewport?: Viewport
  readonly axis?: ScrollAxis
  readonly overscan?: number
  readonly label?: string
  readonly measurements?: MeasurementsOptions
  readonly direction?: Direction
  readonly scroll?: ScrollMode
  readonly onReachEnd?: QRL<() => void>
  readonly reachEndThreshold?: number
  readonly environment?: Partial<DomEnvironment>
}

/** What `useLayn` gives you: the container and content bindings, and the items on screen. */
export interface UseLaynResult<TData = unknown> {
  readonly containerRef: Signal<Element | undefined>
  readonly containerStyle: Record<string, string>
  readonly containerAttrs: ContainerAttrs
  readonly contentAttrs: ContentAria
  readonly items: Signal<readonly LaynItem<TData>[]>
  readonly contentStyle: Signal<Record<string, string>>
  readonly totalSize: Signal<Size>
  readonly setItems: (items: readonly LayoutItem<TData>[]) => void
  readonly setAlgorithm: (algorithm: LayoutAlgorithm) => void
  readonly setGap: (gap: Gap | undefined) => void
  readonly scrollToIndex: (index: number, options?: ScrollToItemOptions) => void
  readonly scrollToItem: (id: ItemId, options?: ScrollToItemOptions) => void
}
