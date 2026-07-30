import type { Signal } from '@builder.io/qwik'
import type { ContainerAttrs, ContentAria } from '@laynjs/adapter-utils'
import type {
  Gap,
  LayoutAlgorithm,
  LayoutItem,
  MeasurementsOptions,
  ScrollAxis,
  Size,
  Viewport,
} from '@laynjs/core'
import type { DomEnvironment } from '@laynjs/dom'
import type { LaynItem } from './item.js'

export interface UseLaynOptions<TData = unknown> {
  readonly items: readonly LayoutItem<TData>[]
  readonly algorithm: LayoutAlgorithm
  readonly gap?: Gap
  readonly viewport?: Viewport
  readonly axis?: ScrollAxis
  readonly overscan?: number
  readonly label?: string
  readonly measurements?: MeasurementsOptions
  readonly environment?: Partial<DomEnvironment>
}

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
}
