import type {
  Direction,
  Gap,
  LayoutAlgorithm,
  LayoutItem,
  MeasurementsOptions,
  Viewport,
} from '@laynjs/core'

/** The adapter-facing subset of `EngineConfig`, before optional fields are resolved. */
export interface EngineInput<TData = unknown> {
  readonly algorithm: LayoutAlgorithm
  readonly items: readonly LayoutItem<TData>[]
  readonly gap?: Gap | undefined
  readonly viewport?: Viewport | undefined
  readonly measurements?: MeasurementsOptions | undefined
  readonly direction?: Direction | undefined
}
