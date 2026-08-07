import { DEFAULT_QUILT_PATTERN } from '../constants.js'
import { positionsBuilder } from '../positions/positions.js'
import type {
  LayoutAlgorithm,
  LayoutContext,
  LayoutItem,
  LayoutResult,
  QuiltOptions,
  QuiltSpan,
} from '../types/index.js'
import { resolveColumnCount, resolveTrackSize } from './column-count.js'

const createGrid = (columns: number) => {
  const rows: boolean[][] = []
  const filled: number[] = []
  let firstOpen = 0
  const rowAt = (r: number): boolean[] => {
    while (rows.length <= r) {
      rows.push(new Array<boolean>(columns).fill(false))
      filled.push(0)
    }
    const row = rows[r]
    return row ?? []
  }
  const fits = (r: number, c: number, cs: number, rs: number): boolean => {
    for (let dr = 0; dr < rs; dr += 1) {
      const row = rowAt(r + dr)
      for (let dc = 0; dc < cs; dc += 1) {
        if (row[c + dc]) {
          return false
        }
      }
    }
    return true
  }
  const mark = (r: number, c: number, cs: number, rs: number): void => {
    for (let dr = 0; dr < rs; dr += 1) {
      const row = rowAt(r + dr)
      for (let dc = 0; dc < cs; dc += 1) {
        row[c + dc] = true
      }
      filled[r + dr] = (filled[r + dr] ?? 0) + cs
    }
    while (firstOpen < rows.length && (filled[firstOpen] ?? 0) === columns) {
      firstOpen += 1
    }
  }
  const claim = (cs: number, rs: number): { row: number; column: number } => {
    for (let r = firstOpen; ; r += 1) {
      if ((filled[r] ?? 0) + cs > columns) {
        continue
      }
      for (let c = 0; c + cs <= columns; c += 1) {
        if (fits(r, c, cs, rs)) {
          mark(r, c, cs, rs)
          return { row: r, column: c }
        }
      }
    }
  }
  return { claim }
}

const spanAt = (pattern: readonly QuiltSpan[], index: number, columns: number): QuiltSpan => {
  const span = pattern[index % pattern.length] ?? [1, 1]
  return [Math.max(1, Math.min(columns, span[0])), Math.max(1, span[1])]
}

export const quilt = (options: QuiltOptions = {}): LayoutAlgorithm => ({
  name: 'quilt',
  capabilities: { incremental: false, requiresMeasuredHeight: false },
  layout(items: readonly LayoutItem[], context: LayoutContext): LayoutResult {
    const { viewport, gap } = context
    const columns = resolveColumnCount(options, viewport.width, gap.x)
    const cell = resolveTrackSize(viewport.width, columns, gap.x)
    const pattern = options.pattern ?? DEFAULT_QUILT_PATTERN
    const grid = createGrid(columns)
    const builder = positionsBuilder(items.length)
    let bottom = 0

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i]
      if (item === undefined) {
        continue
      }
      const [cs, rs] = spanAt(pattern, i, columns)
      const { row, column } = grid.claim(cs, rs)
      const left = column * (cell + gap.x)
      const top = row * (cell + gap.y)
      const width = cs * cell + (cs - 1) * gap.x
      const height = rs * cell + (rs - 1) * gap.y
      builder.push(item.id, left, top, width, height)
      bottom = Math.max(bottom, top + height)
    }

    return {
      positions: builder.build(),
      contentSize: { width: viewport.width, height: bottom },
    }
  },
})
