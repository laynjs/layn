import { DEFAULT_PACK_SIZE } from '../constants.js'
import type {
  LayoutAlgorithm,
  LayoutContext,
  LayoutItem,
  LayoutResult,
  PackingOptions,
} from '../types/index.js'
import { runPacking } from './pack-run.js'
import { createSkyline } from './skyline.js'

const resolveBaseSize = (options: PackingOptions): number =>
  options.baseSize !== undefined && options.baseSize > 0 ? options.baseSize : DEFAULT_PACK_SIZE

export const packing = (options: PackingOptions = {}): LayoutAlgorithm => ({
  name: 'packing',
  capabilities: { incremental: false, requiresMeasuredHeight: false },
  layout(items: readonly LayoutItem[], context: LayoutContext): LayoutResult {
    return runPacking(items, context, resolveBaseSize(options), createSkyline)
  },
})
