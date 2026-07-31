import type { Rect, ScrollAxis } from '@laynjs/core'
import type { ScrollAlign } from '../types/index.js'

export const scrollOffsetFor = (
  rect: Rect,
  axis: ScrollAxis,
  viewportSize: number,
  align: ScrollAlign,
): number => {
  const start = axis === 'vertical' ? rect.y : rect.x
  const extent = axis === 'vertical' ? rect.height : rect.width
  if (align === 'center') {
    return start - (viewportSize - extent) / 2
  }
  if (align === 'end') {
    return start - viewportSize + extent
  }
  return start
}
