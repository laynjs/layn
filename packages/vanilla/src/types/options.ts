import type { ScrollMode } from '@laynjs/adapter-utils'
import type {
  Direction,
  Gap,
  ItemId,
  LayoutAlgorithm,
  LayoutItem,
  MeasurementsOptions,
  ScrollAxis,
  Viewport,
} from '@laynjs/core'
import type { AnimateOption, DomEnvironment } from '@laynjs/dom'

/**
 * Options for `createLayn`. You supply `renderItem`, which fills an element layn has already
 * created, sized and positioned.
 */
export interface LaynOptions<TData = unknown> {
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
  readonly scroll?: ScrollMode
  readonly onReachEnd?: () => void
  readonly reachEndThreshold?: number
  readonly onReorder?: (from: number, to: number) => void
  readonly onDragStart?: (id: ItemId) => void
  readonly onDragEnd?: (id: ItemId) => void
  readonly environment?: Partial<DomEnvironment>
  readonly renderItem?: (element: HTMLElement, item: LayoutItem<TData>) => void
}

export interface RenderOptions<TData = unknown> {
  readonly items: readonly LayoutItem<TData>[]
  readonly algorithm: LayoutAlgorithm
  readonly gap?: Gap
  readonly viewport?: Viewport
  readonly axis?: ScrollAxis
  readonly overscan?: number
  readonly label?: string
  readonly measurements?: MeasurementsOptions
  readonly direction?: Direction
  readonly renderItem?: (item: LayoutItem<TData>) => string
}
