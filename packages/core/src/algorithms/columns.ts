import { positionsBuilder } from '../positions/positions.js'
import type {
  ColumnsOptions,
  LayoutAlgorithm,
  LayoutContext,
  LayoutItem,
  LayoutResult,
} from '../types/index.js'
import { resolveColumnCount } from './column-count.js'

export const columns = (options: ColumnsOptions = {}): LayoutAlgorithm => ({
  name: 'columns',
  capabilities: { incremental: false, requiresMeasuredHeight: true },
  layout(items: readonly LayoutItem[], context: LayoutContext): LayoutResult {
    const { viewport, gap, measurements } = context
    const columnCount = resolveColumnCount(options, viewport.width, gap.x)
    const columnWidth = (viewport.width - gap.x * (columnCount - 1)) / columnCount
    const columnHeights = new Array<number>(columnCount).fill(0)
    const builder = positionsBuilder(items.length)

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i]
      if (item === undefined) {
        continue
      }
      const column = i % columnCount
      const top = columnHeights[column] ?? 0
      const left = column * (columnWidth + gap.x)
      const { height } = measurements.size(item, columnWidth)
      builder.push(item.id, left, top, columnWidth, height)
      columnHeights[column] = top + height + gap.y
    }

    const tallest = columnHeights.reduce((max, height) => (height > max ? height : max), 0)

    return {
      positions: builder.build(),
      contentSize: { width: viewport.width, height: Math.max(0, tallest - gap.y) },
    }
  },
})
