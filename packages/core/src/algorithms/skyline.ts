import type { PackPlacement, SkylineNode } from './types.js'

export const createSkyline = (containerWidth: number) => {
  const nodes: SkylineNode[] = [{ x: 0, y: 0, width: containerWidth }]

  const fitsAt = (index: number, width: number): number => {
    const start = nodes[index]
    if (start === undefined || start.x + width > containerWidth) {
      return -1
    }
    let remaining = width
    let i = index
    let top = start.y
    while (remaining > 0) {
      const node = nodes[i]
      if (node === undefined) {
        return -1
      }
      top = Math.max(top, node.y)
      remaining -= node.width
      i += 1
    }
    return top
  }

  const merge = (): void => {
    for (let i = 0; i < nodes.length - 1; ) {
      const current = nodes[i]
      const next = nodes[i + 1]
      if (current !== undefined && next !== undefined && current.y === next.y) {
        current.width += next.width
        nodes.splice(i + 1, 1)
      } else {
        i += 1
      }
    }
  }

  const raise = (index: number, x: number, top: number, width: number, height: number): void => {
    nodes.splice(index, 0, { x, y: top + height, width })
    for (let i = index + 1; i < nodes.length; ) {
      const node = nodes[i]
      const prev = nodes[i - 1]
      if (node === undefined || prev === undefined || node.x >= prev.x + prev.width) {
        break
      }
      const overlap = prev.x + prev.width - node.x
      node.x += overlap
      node.width -= overlap
      if (node.width <= 0) {
        nodes.splice(i, 1)
      } else {
        break
      }
    }
    merge()
  }

  const place = (width: number, height: number): PackPlacement | undefined => {
    let bestIndex = -1
    let bestBottom = Number.POSITIVE_INFINITY
    let bestX = 0
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i]
      if (node === undefined) {
        continue
      }
      const top = fitsAt(i, width)
      if (top < 0) {
        continue
      }
      const bottom = top + height
      if (bottom < bestBottom || (bottom === bestBottom && node.x < bestX)) {
        bestBottom = bottom
        bestX = node.x
        bestIndex = i
      }
    }
    if (bestIndex === -1) {
      return undefined
    }
    const top = bestBottom - height
    raise(bestIndex, bestX, top, width, height)
    return { x: bestX, y: top }
  }

  return { place }
}
