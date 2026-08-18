import { positionsBuilder } from '../positions/positions.js'
import type {
  HorizontalMasonryOptions,
  LayoutAlgorithm,
  LayoutContext,
  LayoutItem,
  LayoutResult,
} from '../types/index.js'
import { resolveRowCount, resolveTrackSize } from './column-count.js'

const shortestRowIndex = (widths: readonly number[]): number => {
  let index = 0
  let min = widths[0] ?? 0
  for (let i = 1; i < widths.length; i += 1) {
    const width = widths[i] ?? 0
    if (width < min) {
      min = width
      index = i
    }
  }
  return index
}

/**
 * Masonry transposed: fixed-height rows, each item placed in the shortest, content growing to the
 * right. Pair it with `axis: 'horizontal'` on the adapter so scrolling and virtualization follow.
 */
export const horizontalMasonry = (options: HorizontalMasonryOptions = {}): LayoutAlgorithm => ({
  name: 'horizontal-masonry',
  capabilities: { incremental: false, requiresMeasuredHeight: false },
  layout(items: readonly LayoutItem[], context: LayoutContext): LayoutResult {
    const { viewport, gap, measurements } = context
    const rowCount = resolveRowCount(options, viewport.height, gap.y)
    const rowHeight = resolveTrackSize(viewport.height, rowCount, gap.y)
    const rowWidths = new Array<number>(rowCount).fill(0)
    const builder = positionsBuilder(items.length)

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i]
      if (item === undefined) {
        continue
      }
      const row = shortestRowIndex(rowWidths)
      const left = rowWidths[row] ?? 0
      const top = row * (rowHeight + gap.y)
      const width = measurements.aspectRatio(item) * rowHeight
      builder.push(item.id, left, top, width, rowHeight)
      rowWidths[row] = left + width + gap.x
    }

    const widest = rowWidths.reduce((max, width) => (width > max ? width : max), 0)

    return {
      positions: builder.build(),
      contentSize: { width: Math.max(0, widest - gap.x), height: viewport.height },
    }
  },
})
