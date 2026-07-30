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

export const binPacking = (options: BinPackingOptions = {}): LayoutAlgorithm => ({
  name: 'bin-packing',
  capabilities: { incremental: false, requiresMeasuredHeight: false },
  layout(items: readonly LayoutItem[], context: LayoutContext): LayoutResult {
    return runPacking(items, context, resolveBaseSize(options), createMaxRects)
  },
})
