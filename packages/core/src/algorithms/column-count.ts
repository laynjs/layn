import { DEFAULT_COLUMN_COUNT, MIN_COLUMN_COUNT } from '../constants.js'
import type { Breakpoints, TrackCount } from '../types/index.js'
import type { ColumnCountOptions, RowCountOptions } from './types.js'

const clampCount = (count: number): number =>
  Number.isNaN(count) ? MIN_COLUMN_COUNT : Math.max(MIN_COLUMN_COUNT, Math.floor(count))

const countAt = (breakpoints: Breakpoints, extent: number): number | undefined => {
  let matched: number | undefined
  let matchedAt = Number.NEGATIVE_INFINITY
  let smallest: number | undefined
  let smallestAt = Number.POSITIVE_INFINITY

  for (const [key, count] of Object.entries(breakpoints)) {
    const at = Number(key)
    if (!Number.isFinite(at)) {
      continue
    }
    if (at < smallestAt) {
      smallestAt = at
      smallest = count
    }
    if (at <= extent && at > matchedAt) {
      matchedAt = at
      matched = count
    }
  }
  return matched ?? smallest
}

const fromDeclared = (declared: TrackCount, extent: number): number | undefined => {
  if (typeof declared === 'number') {
    return clampCount(declared)
  }
  const count = countAt(declared, extent)
  return count === undefined ? undefined : clampCount(count)
}

const fromTargetSize = (
  target: number,
  max: number | undefined,
  extent: number,
  gap: number,
): number => {
  const fitted = Math.floor((extent + gap) / (target + gap))
  const atLeastOne = clampCount(fitted)
  return max === undefined ? atLeastOne : Math.min(atLeastOne, clampCount(max))
}

const resolveCount = (
  declared: TrackCount | undefined,
  target: number | undefined,
  max: number | undefined,
  extent: number,
  gap: number,
): number => {
  if (declared !== undefined) {
    const count = fromDeclared(declared, extent)
    if (count !== undefined) {
      return count
    }
  }
  if (target !== undefined && target > 0) {
    return fromTargetSize(target, max, extent, gap)
  }
  return DEFAULT_COLUMN_COUNT
}

export const resolveColumnCount = (
  options: ColumnCountOptions,
  viewportWidth: number,
  gapX: number,
): number =>
  resolveCount(options.columns, options.columnWidth, options.maxColumns, viewportWidth, gapX)

export const resolveRowCount = (
  options: RowCountOptions,
  viewportHeight: number,
  gapY: number,
): number => resolveCount(options.rows, options.rowHeight, options.maxRows, viewportHeight, gapY)

export const resolveTrackSize = (extent: number, count: number, gap: number): number =>
  Math.max(0, (extent - gap * (count - 1)) / count)
