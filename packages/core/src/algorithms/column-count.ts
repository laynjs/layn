import { DEFAULT_COLUMN_COUNT, MIN_COLUMN_COUNT } from '../constants.js'
import type { ColumnCountOptions, RowCountOptions } from './types.js'

export const resolveColumnCount = (
  options: ColumnCountOptions,
  viewportWidth: number,
  gapX: number,
): number => {
  if (options.columns !== undefined) {
    return Math.max(MIN_COLUMN_COUNT, Math.floor(options.columns))
  }
  if (options.columnWidth !== undefined && options.columnWidth > 0) {
    const fitted = Math.floor((viewportWidth + gapX) / (options.columnWidth + gapX))
    const atLeastOne = Math.max(MIN_COLUMN_COUNT, fitted)
    return options.maxColumns !== undefined
      ? Math.min(atLeastOne, Math.max(MIN_COLUMN_COUNT, options.maxColumns))
      : atLeastOne
  }
  return DEFAULT_COLUMN_COUNT
}

export const resolveRowCount = (
  options: RowCountOptions,
  viewportHeight: number,
  gapY: number,
): number => {
  if (options.rows !== undefined) {
    return Math.max(MIN_COLUMN_COUNT, Math.floor(options.rows))
  }
  if (options.rowHeight !== undefined && options.rowHeight > 0) {
    const fitted = Math.floor((viewportHeight + gapY) / (options.rowHeight + gapY))
    const atLeastOne = Math.max(MIN_COLUMN_COUNT, fitted)
    return options.maxRows !== undefined
      ? Math.min(atLeastOne, Math.max(MIN_COLUMN_COUNT, options.maxRows))
      : atLeastOne
  }
  return DEFAULT_COLUMN_COUNT
}

export const resolveTrackSize = (extent: number, count: number, gap: number): number =>
  Math.max(0, (extent - gap * (count - 1)) / count)
