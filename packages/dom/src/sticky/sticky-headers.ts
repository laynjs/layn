import type { LayoutEngine } from '@laynjs/core'
import { STICKY_ATTR, STICKY_Z_INDEX } from '../constants.js'
import type { StickyHeaders, StickySection, StickySetup } from '../types/index.js'

const sectionsOf = (engine: LayoutEngine, isHeader: StickySetup['isHeader']): StickySection[] => {
  const snapshot = engine.getSnapshot()
  const positions = snapshot.positions
  const found: StickySection[] = []

  for (let index = 0; index < snapshot.items.length; index += 1) {
    const item = snapshot.items[index]
    if (item === undefined || !isHeader(item)) {
      continue
    }
    const rect = positions.rectAt(index)
    const previous = found[found.length - 1]
    if (previous !== undefined) {
      found[found.length - 1] = { ...previous, bottom: rect.y }
    }
    found.push({ index, top: rect.y, size: rect.height, bottom: Number.POSITIVE_INFINITY })
  }

  const last = found[found.length - 1]
  if (last !== undefined) {
    found[found.length - 1] = { ...last, bottom: snapshot.contentSize.height }
  }
  return found
}

export const createStickyHeaders = (setup: StickySetup): StickyHeaders => {
  let sections: StickySection[] = []
  let pinned: StickySection | undefined
  let offset = 0

  const clear = (section: StickySection | undefined): void => {
    const element = section === undefined ? undefined : setup.elementOf(section.index)
    if (element === undefined) {
      return
    }
    element.style.translate = ''
    element.style.zIndex = ''
    element.removeAttribute(STICKY_ATTR)
  }

  const activeAt = (start: number): StickySection | undefined => {
    for (const section of sections) {
      if (start < section.bottom && start + section.size > section.top) {
        return section
      }
    }
    return undefined
  }

  const paint = (): void => {
    const section = pinned
    if (section === undefined) {
      return
    }
    const element = setup.elementOf(section.index)
    if (element === undefined) {
      return
    }
    element.style.translate = offset === 0 ? '' : `0px ${offset}px`
    element.style.zIndex = String(STICKY_Z_INDEX)
    element.setAttribute(STICKY_ATTR, '')
  }

  return {
    refresh() {
      clear(pinned)
      sections = sectionsOf(setup.engine, setup.isHeader)
      pinned = undefined
      offset = 0
    },
    update(start: number) {
      const next = activeAt(start)
      if (next !== pinned) {
        clear(pinned)
        pinned = next
      }
      if (next === undefined) {
        return
      }
      const limit = Math.max(0, next.bottom - next.size - next.top)
      offset = Math.min(Math.max(0, start - next.top), limit)
      paint()
    },
    pinnedIndex: () => pinned?.index,
    release() {
      clear(pinned)
      pinned = undefined
    },
  }
}
