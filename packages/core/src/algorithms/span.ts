import { MIN_SPAN } from '../constants.js'
import type { QuiltSpan } from '../types/index.js'

export const resolveSpan = (span: number, trackCount: number): number => {
  if (Number.isNaN(span)) {
    return MIN_SPAN
  }
  return Math.min(trackCount, Math.max(MIN_SPAN, Math.floor(span)))
}

export const blockSpan = (span: number, trackCount: number): QuiltSpan => {
  const size = resolveSpan(span, trackCount)
  return [size, size]
}
