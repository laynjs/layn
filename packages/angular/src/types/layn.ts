import type { Signal } from '@angular/core'
import type { ContainerAttrs, ContentAria, ScrollMode } from '@laynjs/adapter-utils'
import type {
  Direction,
  Gap,
  ItemId,
  LayoutAlgorithm,
  LayoutEngine,
  LayoutItem,
  MeasurementsOptions,
  Rect,
  ScrollAxis,
  Size,
  Viewport,
} from '@laynjs/core'
import type { AnimateOption, DomEnvironment, ScrollToItemOptions } from '@laynjs/dom'
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

export interface LaynItemTarget {
  observeItem(id: ItemId, element: HTMLElement): void
  unobserveItem(id: ItemId): void
}

export interface LaynContainerTarget {
  attachContainer(element: HTMLElement): void
}

export interface LaynItemBinding {
  readonly ref: LaynItemTarget
  readonly id: ItemId
  readonly rect: Rect
}

/** What `useLayn` gives you: the container and content bindings, and the items on screen. */
export interface LaynRef<TData = unknown> extends LaynItemTarget, LaynContainerTarget {
  readonly items: Signal<readonly LaynItem<TData>[]>
  readonly contentStyle: Signal<Record<string, string>>
  readonly totalSize: Signal<Size>
  readonly containerStyle: Record<string, string>
  readonly containerAttrs: ContainerAttrs
  readonly contentAttrs: ContentAria
  readonly engine: LayoutEngine
  setItems(items: readonly LayoutItem<TData>[]): void
  setAlgorithm(algorithm: LayoutAlgorithm): void
  setGap(gap: Gap | undefined): void
  scrollToIndex(index: number, options?: ScrollToItemOptions): void
  scrollToItem(id: ItemId, options?: ScrollToItemOptions): void
  startDrag(id: ItemId, event: PointerEvent): void
}
