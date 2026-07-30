import { MAXRECTS_FREE_CAP } from '../constants.js'
import type { FreeRect, PackPlacement } from './types.js'

const overlaps = (free: FreeRect, x: number, y: number, w: number, h: number): boolean =>
  x < free.x + free.width && x + w > free.x && y < free.y + free.height && y + h > free.y

const contains = (outer: FreeRect, inner: FreeRect): boolean =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y + inner.height <= outer.y + outer.height

const splitAround = (free: FreeRect, x: number, y: number, w: number, h: number): FreeRect[] => {
  if (!overlaps(free, x, y, w, h)) {
    return [free]
  }
  const parts: FreeRect[] = []
  if (x > free.x) {
    parts.push({ x: free.x, y: free.y, width: x - free.x, height: free.height })
  }
  if (x + w < free.x + free.width) {
    parts.push({ x: x + w, y: free.y, width: free.x + free.width - (x + w), height: free.height })
  }
  if (y > free.y) {
    parts.push({ x: free.x, y: free.y, width: free.width, height: y - free.y })
  }
  if (y + h < free.y + free.height) {
    parts.push({ x: free.x, y: y + h, width: free.width, height: free.y + free.height - (y + h) })
  }
  return parts
}

const isRedundant = (rects: FreeRect[], i: number): boolean => {
  const candidate = rects[i]
  if (candidate === undefined) {
    return true
  }
  for (let j = 0; j < rects.length; j += 1) {
    const other = rects[j]
    if (i === j || other === undefined || !contains(other, candidate)) {
      continue
    }
    if (!contains(candidate, other) || i > j) {
      return true
    }
  }
  return false
}

const prune = (rects: FreeRect[]): FreeRect[] => rects.filter((_, i) => !isRedundant(rects, i))

const retire = (rects: FreeRect[]): FreeRect[] => {
  if (rects.length <= MAXRECTS_FREE_CAP) {
    return rects
  }
  return [...rects].sort((a, b) => b.y - a.y || b.width - a.width).slice(0, MAXRECTS_FREE_CAP)
}

export const createMaxRects = (containerWidth: number) => {
  let free: FreeRect[] = [{ x: 0, y: 0, width: containerWidth, height: Number.POSITIVE_INFINITY }]

  const place = (width: number, height: number): PackPlacement | undefined => {
    let spot: FreeRect | undefined
    let bestBottom = Number.POSITIVE_INFINITY
    let bestX = Number.POSITIVE_INFINITY
    for (const candidate of free) {
      if (candidate.width < width || candidate.height < height) {
        continue
      }
      const bottom = candidate.y + height
      if (bottom < bestBottom || (bottom === bestBottom && candidate.x < bestX)) {
        bestBottom = bottom
        bestX = candidate.x
        spot = candidate
      }
    }
    if (spot === undefined) {
      return undefined
    }
    const x = spot.x
    const y = spot.y
    const next: FreeRect[] = []
    for (const rect of free) {
      next.push(...splitAround(rect, x, y, width, height))
    }
    free = prune(retire(next))
    return { x, y }
  }

  return { place }
}
