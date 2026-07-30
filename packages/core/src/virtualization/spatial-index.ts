import { DEFAULT_BAND_SIZE, DEFAULT_OVERSCAN } from '../constants.js'
import type { Positions, ScrollWindow, SpatialIndex, SpatialIndexOptions } from '../types/index.js'

export const createSpatialIndex = (
  positions: Positions,
  options: SpatialIndexOptions = {},
): SpatialIndex => {
  const axis = options.axis ?? 'vertical'
  const bandSize =
    options.bandSize !== undefined && options.bandSize > 0 ? options.bandSize : DEFAULT_BAND_SIZE
  const count = positions.count
  const starts = axis === 'vertical' ? positions.y : positions.x
  const extents = axis === 'vertical' ? positions.height : positions.width

  const bands = new Map<number, number[]>()
  for (let i = 0; i < count; i += 1) {
    const start = starts[i] ?? 0
    const end = start + (extents[i] ?? 0)
    const firstBand = Math.floor(start / bandSize)
    const lastBand = Math.floor(Math.max(start, end - 1) / bandSize)
    for (let band = firstBand; band <= lastBand; band += 1) {
      const bucket = bands.get(band)
      if (bucket === undefined) {
        bands.set(band, [i])
      } else {
        bucket.push(i)
      }
    }
  }

  const intersects = (i: number, rangeStart: number, rangeEnd: number): boolean => {
    const start = starts[i] ?? 0
    const end = start + (extents[i] ?? 0)
    return end > rangeStart && start < rangeEnd
  }

  const query = (window: ScrollWindow, overscan = DEFAULT_OVERSCAN): readonly number[] => {
    const rangeStart = window.start - overscan
    const rangeEnd = window.start + window.size + overscan
    const firstBand = Math.floor(rangeStart / bandSize)
    const lastBand = Math.floor(rangeEnd / bandSize)

    const seen = new Set<number>()
    for (let band = firstBand; band <= lastBand; band += 1) {
      const bucket = bands.get(band)
      if (bucket === undefined) {
        continue
      }
      for (const i of bucket) {
        if (!seen.has(i) && intersects(i, rangeStart, rangeEnd)) {
          seen.add(i)
        }
      }
    }

    return [...seen].sort((a, b) => a - b)
  }

  return { query }
}
