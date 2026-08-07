import { describe, expect, it } from 'vitest'
import type { ItemId, Size } from '../types/index.js'
import { createMeasurements } from './measurements.js'

const withCache = (entries: Array<readonly [ItemId, Size]>) =>
  createMeasurements({ cache: { get: (id) => new Map(entries).get(id) } })

describe('createMeasurements', () => {
  it('derives the height from an explicit aspect ratio', () => {
    expect(createMeasurements().size({ id: 1, aspectRatio: 2 }, 300)).toEqual({
      width: 300,
      height: 150,
    })
  })

  it('uses a measured height at the width it was measured at', () => {
    const measurements = withCache([[1, { width: 300, height: 90 }]])

    expect(measurements.size({ id: 1, aspectRatio: 2 }, 300)).toEqual({ width: 300, height: 90 })
  })

  it('ignores a measured height once the target width changes', () => {
    const measurements = withCache([[1, { width: 300, height: 90 }]])

    expect(measurements.size({ id: 1, aspectRatio: 2 }, 500)).toEqual({ width: 500, height: 250 })
  })

  it('tolerates sub-pixel drift between the layout and the measurement', () => {
    const measurements = withCache([[1, { width: 300.2, height: 90 }]])

    expect(measurements.size({ id: 1, aspectRatio: 2 }, 300)).toEqual({ width: 300, height: 90 })
  })

  it('falls back to the estimator when the cache does not apply', () => {
    const measurements = createMeasurements({
      cache: { get: () => ({ width: 100, height: 40 }) },
      estimateHeight: () => 77,
    })

    expect(measurements.size({ id: 1 }, 300)).toEqual({ width: 300, height: 77 })
  })

  it('prefers a fixed height over the fallback ratio', () => {
    expect(createMeasurements().size({ id: 1, height: 42 }, 300)).toEqual({
      width: 300,
      height: 42,
    })
  })
})
