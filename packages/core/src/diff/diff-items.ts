import type { ItemsDiff, ItemsDiffKind, LayoutItem } from '../types/index.js'

const sameLayoutInput = (a: LayoutItem, b: LayoutItem): boolean =>
  a.id === b.id &&
  a.width === b.width &&
  a.height === b.height &&
  a.aspectRatio === b.aspectRatio &&
  a.span === b.span

const matches = (
  previous: readonly LayoutItem[],
  next: readonly LayoutItem[],
  previousIndex: number,
  nextIndex: number,
): boolean => {
  const a = previous[previousIndex]
  const b = next[nextIndex]
  return a !== undefined && b !== undefined && sameLayoutInput(a, b)
}

const countPrefix = (previous: readonly LayoutItem[], next: readonly LayoutItem[]): number => {
  const max = Math.min(previous.length, next.length)
  let count = 0
  while (count < max && matches(previous, next, count, count)) {
    count += 1
  }
  return count
}

const countSuffix = (
  previous: readonly LayoutItem[],
  next: readonly LayoutItem[],
  prefix: number,
): number => {
  const max = Math.min(previous.length, next.length) - prefix
  let count = 0
  while (
    count < max &&
    matches(previous, next, previous.length - 1 - count, next.length - 1 - count)
  ) {
    count += 1
  }
  return count
}

const kindOf = (
  previousLength: number,
  prefix: number,
  added: number,
  removed: number,
): ItemsDiffKind => {
  if (added === 0 && removed === 0) {
    return 'identical'
  }
  if (removed === 0) {
    if (prefix === previousLength) {
      return 'append'
    }
    return prefix === 0 ? 'prepend' : 'insert'
  }
  return added === 0 ? 'remove' : 'replace'
}

export const diffItems = (
  previous: readonly LayoutItem[],
  next: readonly LayoutItem[],
): ItemsDiff => {
  const commonPrefix = countPrefix(previous, next)
  const commonSuffix = countSuffix(previous, next, commonPrefix)
  const addedCount = next.length - commonPrefix - commonSuffix
  const removedCount = previous.length - commonPrefix - commonSuffix

  return {
    kind: kindOf(previous.length, commonPrefix, addedCount, removedCount),
    commonPrefix,
    commonSuffix,
    addedCount,
    removedCount,
  }
}
