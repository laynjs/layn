import type { Signal } from '@angular/core'
import type { ContainerAttrs, ContentAria } from '@laynjs/adapter-utils'
import type {
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
}
