import type { ScrollMode } from '@laynjs/adapter-utils'
import type {
  Gap,
  LayoutAlgorithm,
  LayoutItem,
  MeasurementsOptions,
  ScrollAxis,
  Viewport,
} from '@laynjs/core'
import type { AnimateOption, DomEnvironment } from '@laynjs/dom'

export interface LaynOptions<TData = unknown> {
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
  readonly renderItem?: (item: LayoutItem<TData>) => string
}
