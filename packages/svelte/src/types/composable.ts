import type { ContainerAttrs, ContentAria, ScrollMode } from '@laynjs/adapter-utils'
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
import type { Action } from 'svelte/action'
import type { Readable } from 'svelte/store'
import type { ItemActionParams, LaynItem } from './item.js'

export interface UseLaynOptions<TData = unknown> {
  readonly items: readonly LayoutItem<TData>[]
  readonly algorithm: LayoutAlgorithm
  readonly gap?: Gap
  readonly viewport?: Viewport
  readonly axis?: ScrollAxis
  readonly overscan?: number
  readonly label?: string
  readonly measurements?: MeasurementsOptions
  readonly animate?: AnimateOption
  readonly scroll?: ScrollMode
  readonly environment?: Partial<DomEnvironment>
}

export interface UseLaynResult<TData = unknown> {
  readonly container: Action<HTMLElement>
  readonly containerStyle: Record<string, string>
  readonly containerAttrs: ContainerAttrs
  readonly contentAttrs: ContentAria
  readonly item: Action<HTMLElement, ItemActionParams>
  readonly contentStyle: Readable<Record<string, string>>
  readonly items: Readable<readonly LaynItem<TData>[]>
  readonly totalSize: Readable<Size>
  readonly engine: LayoutEngine
  readonly setItems: (items: readonly LayoutItem<TData>[]) => void
  readonly setAlgorithm: (algorithm: LayoutAlgorithm) => void
  readonly setGap: (gap: Gap | undefined) => void
  readonly scrollToIndex: (index: number, options?: ScrollToItemOptions) => void
  readonly scrollToItem: (id: ItemId, options?: ScrollToItemOptions) => void
}
