import type { ContainerAttrs, ContentAria } from '@laynjs/adapter-utils'
import type {
  Gap,
  LayoutAlgorithm,
  LayoutEngine,
  LayoutItem,
  MeasurementsOptions,
  ScrollAxis,
  Size,
  Viewport,
} from '@laynjs/core'
import type { DomEnvironment } from '@laynjs/dom'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { LaynElementRef, LaynItem } from './item.js'

export interface UseLaynOptions<TData = unknown> {
  readonly items: MaybeRefOrGetter<readonly LayoutItem<TData>[]>
  readonly algorithm: MaybeRefOrGetter<LayoutAlgorithm>
  readonly gap?: MaybeRefOrGetter<Gap | undefined>
  readonly viewport?: Viewport
  readonly axis?: ScrollAxis
  readonly overscan?: number
  readonly label?: string
  readonly measurements?: MeasurementsOptions
  readonly environment?: Partial<DomEnvironment>
}

export interface UseLaynResult<TData = unknown> {
  readonly containerRef: LaynElementRef
  readonly containerStyle: Record<string, string>
  readonly containerAttrs: ContainerAttrs
  readonly contentAttrs: ContentAria
  readonly contentStyle: ComputedRef<Record<string, string>>
  readonly items: ComputedRef<readonly LaynItem<TData>[]>
  readonly totalSize: ComputedRef<Size>
  readonly engine: LayoutEngine
}
