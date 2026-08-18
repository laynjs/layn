import { DEFAULT_PACK_SIZE } from '../constants.js'
import type {
  BinPackingOptions,
  LayoutAlgorithm,
  LayoutContext,
  LayoutItem,
  LayoutResult,
} from '../types/index.js'
import { createMaxRects } from './maxrects.js'
import { runPacking } from './pack-run.js'

const resolveBaseSize = (options: BinPackingOptions): number =>
  options.baseSize !== undefined && options.baseSize > 0 ? options.baseSize : DEFAULT_PACK_SIZE

/**
 * Maximal-rectangles packing, which backfills earlier holes with later items for a visibly tighter
 * result than `packing`.
 *
 * Deliberately the most expensive algorithm here: O(n * cap^2) rather than O(n), which is hundreds
 * of milliseconds at fifty thousand items. Use `packing` when the count is large.
 */
export const binPacking = (options: BinPackingOptions = {}): LayoutAlgorithm => ({
  name: 'bin-packing',
  capabilities: { incremental: false, requiresMeasuredHeight: false },
  layout(items: readonly LayoutItem[], context: LayoutContext): LayoutResult {
    return runPacking(items, context, resolveBaseSize(options), createMaxRects)
  },
})
