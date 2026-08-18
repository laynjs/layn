import { DEFAULT_ROW_HEIGHT } from '../constants.js'
import { positionsBuilder } from '../positions/positions.js'
import type {
  JustifiedOptions,
  LayoutAlgorithm,
  LayoutContext,
  LayoutItem,
  LayoutResult,
  Measurements,
} from '../types/index.js'
import { mirrorExtent } from './direction.js'

const measureRow = (
  items: readonly LayoutItem[],
  start: number,
  measurements: Measurements,
  viewportWidth: number,
  gapX: number,
  targetHeight: number,
): { end: number; ratios: number[]; height: number } => {
  const ratios: number[] = []
  let sum = 0
  let end = start
  let height = targetHeight
  while (end < items.length) {
    const item = items[end]
    if (item === undefined) {
      break
    }
    const ratio = measurements.aspectRatio(item)
    ratios.push(ratio)
    sum += ratio
    end += 1
    height = (viewportWidth - gapX * (ratios.length - 1)) / sum
    if (height <= targetHeight) {
      break
    }
  }
  return { end, ratios, height }
}

const resolveTargetHeight = (options: JustifiedOptions): number =>
  options.targetRowHeight !== undefined && options.targetRowHeight > 0
    ? options.targetRowHeight
    : DEFAULT_ROW_HEIGHT

/**
 * Rows filled greedily, then scaled so every full row spans the container exactly, preserving each
 * item's aspect ratio. Both edges stay flush. The trailing row is left unstretched.
 */
export const justified = (options: JustifiedOptions = {}): LayoutAlgorithm => ({
  name: 'justified',
  capabilities: { incremental: false, requiresMeasuredHeight: false },
  layout(items: readonly LayoutItem[], context: LayoutContext): LayoutResult {
    const { viewport, gap, measurements } = context
    const targetHeight = resolveTargetHeight(options)
    const maxHeight = options.maxRowHeight ?? Number.POSITIVE_INFINITY
    const builder = positionsBuilder(items.length, mirrorExtent(context))

    let top = 0
    let start = 0
    while (start < items.length) {
      const { end, ratios, height } = measureRow(
        items,
        start,
        measurements,
        viewport.width,
        gap.x,
        targetHeight,
      )
      const isLastRow = end >= items.length
      const stretched = isLastRow && height > targetHeight ? targetHeight : height
      const rowHeight = Math.min(maxHeight, stretched)

      let left = 0
      for (let j = 0; j < ratios.length; j += 1) {
        const item = items[start + j]
        const ratio = ratios[j]
        if (item !== undefined && ratio !== undefined) {
          const width = ratio * rowHeight
          builder.push(item.id, left, top, width, rowHeight)
          left += width + gap.x
        }
      }

      top += rowHeight + gap.y
      start = end
    }

    return {
      positions: builder.build(),
      contentSize: { width: viewport.width, height: Math.max(0, top - gap.y) },
    }
  },
})
