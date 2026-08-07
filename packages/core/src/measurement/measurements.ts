import { FALLBACK_ASPECT_RATIO, MEASURED_WIDTH_EPSILON } from '../constants.js'
import type { LayoutItem, Measurements, MeasurementsOptions, Size } from '../types/index.js'

const explicitAspectRatio = (item: LayoutItem): number | undefined => {
  if (item.aspectRatio !== undefined && item.aspectRatio > 0) {
    return item.aspectRatio
  }
  if (item.width !== undefined && item.height !== undefined && item.height > 0) {
    return item.width / item.height
  }
  return undefined
}

const hasOnlyFixedHeight = (item: LayoutItem): boolean =>
  item.height !== undefined && item.width === undefined && item.aspectRatio === undefined

export const createMeasurements = (options: MeasurementsOptions = {}): Measurements => {
  const fallbackRatio =
    options.defaultAspectRatio !== undefined && options.defaultAspectRatio > 0
      ? options.defaultAspectRatio
      : FALLBACK_ASPECT_RATIO

  const aspectRatio = (item: LayoutItem): number => {
    const explicit = explicitAspectRatio(item)
    if (explicit !== undefined) {
      return explicit
    }
    const cached = options.cache?.get(item.id)
    if (cached !== undefined && cached.height > 0) {
      return cached.width / cached.height
    }
    return fallbackRatio
  }

  const size = (item: LayoutItem, targetWidth: number): Size => {
    const cached = options.cache?.get(item.id)
    if (cached !== undefined && Math.abs(cached.width - targetWidth) < MEASURED_WIDTH_EPSILON) {
      return { width: targetWidth, height: cached.height }
    }
    if (hasOnlyFixedHeight(item) && item.height !== undefined) {
      return { width: targetWidth, height: item.height }
    }
    const ratio = explicitAspectRatio(item)
    if (ratio !== undefined) {
      return { width: targetWidth, height: targetWidth / ratio }
    }
    if (options.estimateHeight !== undefined) {
      return { width: targetWidth, height: options.estimateHeight(item, targetWidth) }
    }
    return { width: targetWidth, height: targetWidth / fallbackRatio }
  }

  return { size, aspectRatio }
}
