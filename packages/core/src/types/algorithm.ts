import type { Direction, Gap, Size, Viewport } from './common.js'
import type { LayoutItem } from './item.js'
import type { Measurements } from './measurement.js'
import type { Positions } from './positions.js'

/** What an algorithm is given: the box, the spacing, how to size an item, and the direction. */
export interface LayoutContext {
  readonly viewport: Viewport
  readonly gap: Gap
  readonly measurements: Measurements
  readonly direction?: Direction
}

/** What an algorithm returns. */
export interface LayoutResult {
  readonly positions: Positions
  readonly contentSize: Size
  /**
   * Opaque continuation token. The engine stores it and hands it back as `previous`, which is how
   * an incremental algorithm resumes instead of starting over. Ignore it unless you support that.
   */
  readonly state?: unknown
}

export interface AlgorithmCapabilities {
  /** Whether `layout` can continue from `previous` when items are only appended. */
  readonly incremental: boolean
  /** Whether items must be measured in the DOM before the layout is meaningful. */
  readonly requiresMeasuredHeight: boolean
}

/**
 * A layout algorithm: a pure function from items to rectangles. The same inputs must always produce
 * the same output, since that is what makes server and client agree.
 *
 * See the "Write your own algorithm" guide; `createPositionsBuilder` is the intended way to emit
 * positions without allocating an object per item.
 */
export interface LayoutAlgorithm {
  /** Used by hydration to check that the client is running the same algorithm as the server. */
  readonly name: string
  readonly capabilities: AlgorithmCapabilities
  layout(
    items: readonly LayoutItem[],
    context: LayoutContext,
    previous?: LayoutResult,
  ): LayoutResult
}
