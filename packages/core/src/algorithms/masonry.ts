import { extendPositions, positionsBuilder } from '../positions/positions.js'
import type {
  LayoutAlgorithm,
  LayoutContext,
  LayoutItem,
  LayoutResult,
  MasonryOptions,
} from '../types/index.js'
import { resolveColumnCount, resolveTrackSize } from './column-count.js'
import { mirrorExtent } from './direction.js'
import type { MasonryState } from './types.js'

const shortestColumnIndex = (heights: readonly number[]): number => {
  let index = 0
  let min = heights[0] ?? 0
  for (let i = 1; i < heights.length; i += 1) {
    const height = heights[i] ?? 0
    if (height < min) {
      min = height
      index = i
    }
  }
  return index
}

const readState = (previous: LayoutResult | undefined): MasonryState | undefined => {
  const state = previous?.state
  if (state === null || typeof state !== 'object') {
    return undefined
  }
  const candidate = state as Partial<MasonryState>
  if (
    typeof candidate.columnCount !== 'number' ||
    typeof candidate.columnWidth !== 'number' ||
    typeof candidate.itemCount !== 'number' ||
    !Array.isArray(candidate.columnHeights) ||
    candidate.data === undefined
  ) {
    return undefined
  }
  return candidate as MasonryState
}

const continueFrom = (
  previous: LayoutResult | undefined,
  columnCount: number,
  columnWidth: number,
  itemCount: number,
) => {
  if (previous === undefined) {
    return undefined
  }
  const state = readState(previous)
  if (
    state === undefined ||
    state.columnCount !== columnCount ||
    state.columnWidth !== columnWidth ||
    itemCount < state.itemCount
  ) {
    return undefined
  }
  return {
    columnHeights: [...state.columnHeights],
    startIndex: state.itemCount,
    builder: extendPositions(state.data, itemCount - state.itemCount),
  }
}

/**
 * Columns of equal width; each item goes into the shortest column at that moment. The classic
 * variable-height grid.
 *
 * Appending is incremental: the algorithm continues from stored column state, so adding a page to a
 * hundred thousand items costs the same as adding it to none.
 */
export const masonry = (options: MasonryOptions = {}): LayoutAlgorithm => ({
  name: 'masonry',
  capabilities: { incremental: true, requiresMeasuredHeight: true },
  layout(
    items: readonly LayoutItem[],
    context: LayoutContext,
    previous?: LayoutResult,
  ): LayoutResult {
    const { viewport, gap, measurements } = context
    const columnCount = resolveColumnCount(options, viewport.width, gap.x)
    const columnWidth = resolveTrackSize(viewport.width, columnCount, gap.x)

    const carried = continueFrom(previous, columnCount, columnWidth, items.length)
    const columnHeights = carried?.columnHeights ?? new Array<number>(columnCount).fill(0)
    const builder = carried?.builder ?? positionsBuilder(items.length, mirrorExtent(context))
    const startIndex = carried?.startIndex ?? 0

    for (let i = startIndex; i < items.length; i += 1) {
      const item = items[i]
      if (item === undefined) {
        continue
      }
      const column = shortestColumnIndex(columnHeights)
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
      state: {
        columnCount,
        columnWidth,
        columnHeights,
        itemCount: items.length,
        data: builder.data,
      },
    }
  },
})
