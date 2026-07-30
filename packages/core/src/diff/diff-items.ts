import type { ItemsDiff, LayoutItem } from '../types/index.js'

const sameLayoutInput = (a: LayoutItem, b: LayoutItem): boolean =>
  a.id === b.id &&
  a.width === b.width &&
  a.height === b.height &&
  a.aspectRatio === b.aspectRatio &&
  a.span === b.span

export const diffItems = (
  previous: readonly LayoutItem[],
  next: readonly LayoutItem[],
): ItemsDiff => {
  const max = Math.min(previous.length, next.length)
  let commonPrefix = 0
  while (commonPrefix < max) {
    const a = previous[commonPrefix]
    const b = next[commonPrefix]
    if (a === undefined || b === undefined || !sameLayoutInput(a, b)) {
      break
    }
    commonPrefix += 1
  }

  if (commonPrefix === previous.length && commonPrefix === next.length) {
    return { kind: 'identical', commonPrefix }
  }
  if (commonPrefix === previous.length) {
    return { kind: 'append', commonPrefix }
  }
  return { kind: 'replace', commonPrefix }
}
