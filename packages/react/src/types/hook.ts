import type { ContainerAria, ContentAria, ScrollMode } from '@laynjs/adapter-utils'
import type {
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

export interface UseLaynOptions<TData = unknown> {
  readonly items: readonly LayoutItem<TData>[]
  readonly algorithm: LayoutAlgorithm
  readonly gap?: Gap
  readonly viewport?: Viewport
  readonly axis?: ScrollAxis
  readonly overscan?: number
  readonly label?: string
  readonly animate?: AnimateOption
  readonly scroll?: ScrollMode
  readonly onReachEnd?: () => void
  readonly reachEndThreshold?: number
  readonly measurements?: MeasurementsOptions
  readonly environment?: Partial<DomEnvironment>
}

export interface UseLaynResult<TData = unknown> {
  readonly containerProps: ContainerAria & {
    readonly ref: (element: HTMLElement | null) => void
    readonly style: CSSProperties
    readonly tabIndex: number
  }
  readonly contentProps: ContentAria & {
    readonly style: CSSProperties
  }
  readonly items: readonly LaynItem<TData>[]
  readonly totalSize: Size
  readonly engine: LayoutEngine
  scrollToIndex(index: number, options?: ScrollToItemOptions): void
  scrollToItem(id: ItemId, options?: ScrollToItemOptions): void
}
