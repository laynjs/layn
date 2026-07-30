import type { ScrollAxis, ScrollWindow, Size } from '@laynjs/core'
import type { ScrollTarget } from '../types/index.js'

export const isElement = (target: ScrollTarget): target is HTMLElement => 'scrollTop' in target

export const readScrollWindow = (
  target: ScrollTarget,
  axis: ScrollAxis,
  origin = 0,
): ScrollWindow => {
  if (isElement(target)) {
    return axis === 'vertical'
      ? { start: target.scrollTop, size: target.clientHeight }
      : { start: target.scrollLeft, size: target.clientWidth }
  }
  return axis === 'vertical'
    ? { start: target.scrollY - origin, size: target.innerHeight }
    : { start: target.scrollX - origin, size: target.innerWidth }
}

export const readOrigin = (
  origin: HTMLElement | undefined,
  target: ScrollTarget,
  axis: ScrollAxis,
): number => {
  if (origin === undefined || isElement(target)) {
    return 0
  }
  const rect = origin.getBoundingClientRect()
  return axis === 'vertical' ? rect.top + target.scrollY : rect.left + target.scrollX
}

export const readViewportSize = (target: ScrollTarget): Size =>
  isElement(target)
    ? { width: target.clientWidth, height: target.clientHeight }
    : { width: target.innerWidth, height: target.innerHeight }
