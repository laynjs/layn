import type { Gap, Size, Viewport } from './common.js'
import type { LayoutItem } from './item.js'
import type { Measurements } from './measurement.js'
import type { Positions } from './positions.js'

export interface LayoutContext {
  readonly viewport: Viewport
  readonly gap: Gap
  readonly measurements: Measurements
}

export interface LayoutResult {
  readonly positions: Positions
  readonly contentSize: Size
  readonly state?: unknown
}

export interface AlgorithmCapabilities {
  readonly incremental: boolean
  readonly requiresMeasuredHeight: boolean
}

export interface LayoutAlgorithm {
  readonly name: string
  readonly capabilities: AlgorithmCapabilities
  layout(
    items: readonly LayoutItem[],
    context: LayoutContext,
    previous?: LayoutResult,
  ): LayoutResult
}
