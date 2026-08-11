import { createEngine, type LayoutItem, masonry, sections } from '@laynjs/core'
import { describe, expect, it } from 'vitest'
import { FakeElement } from '../__fixtures__/dom.js'
import { STICKY_ATTR } from '../constants.js'
import { createStickyHeaders } from './sticky-headers.js'

const isHeader = (item: LayoutItem): boolean => (item.data as { header?: boolean })?.header === true

const build = (sectionCount: number, perSection: number) => {
  const items: LayoutItem[] = []
  for (let s = 0; s < sectionCount; s += 1) {
    items.push({ id: `h${s}`, height: 50, data: { header: true } })
    for (let i = 0; i < perSection; i += 1) {
      items.push({ id: `${s}-${i}`, height: 100, width: 100 })
    }
  }
  const engine = createEngine({
    algorithm: sections(masonry({ columns: 1 }), { isHeader }),
    viewport: { width: 100, height: 300 },
    gap: { x: 0, y: 0 },
    items,
  })
  const elements = new Map<number, FakeElement>()
  const sticky = createStickyHeaders({
    engine,
    isHeader,
    elementOf: (index) => {
      let element = elements.get(index)
      if (element === undefined) {
        element = new FakeElement()
        elements.set(index, element)
      }
      return element as unknown as HTMLElement
    },
  })
  sticky.refresh()
  return { sticky, engine, elements }
}

describe('createStickyHeaders', () => {
  it('leaves a header untouched while it is still at its natural place', () => {
    const { sticky, elements } = build(2, 2)

    sticky.update(0)

    expect(sticky.pinnedIndex()).toBe(0)
    expect(elements.get(0)?.style.translate).toBe('')
  })

  it('holds the header in place while its section scrolls past', () => {
    const { sticky, elements } = build(2, 2)

    sticky.update(120)

    expect(sticky.pinnedIndex()).toBe(0)
    expect(elements.get(0)?.style.translate).toBe('0px 120px')
    expect(elements.get(0)?.attributes.has(STICKY_ATTR)).toBe(true)
  })

  it('stops the header at the bottom of its own section', () => {
    const { sticky, elements } = build(2, 2)

    sticky.update(240)

    const offset = Number(elements.get(0)?.style.translate?.split(' ')[1]?.replace('px', ''))
    expect(offset).toBe(200)
  })

  it('hands over to the next header and releases the previous one', () => {
    const { sticky, elements } = build(2, 2)
    sticky.update(120)
    expect(elements.get(0)?.style.translate).toBe('0px 120px')

    sticky.update(300)

    expect(sticky.pinnedIndex()).toBe(3)
    expect(elements.get(0)?.style.translate).toBe('')
    expect(elements.get(0)?.attributes.has(STICKY_ATTR)).toBe(false)
  })

  it('lifts the pinned header above the tiles', () => {
    const { sticky, elements } = build(2, 2)

    sticky.update(120)

    expect(elements.get(0)?.style.zIndex).toBe('2')
  })

  it('releases the held header when the layout is recomputed', () => {
    const { sticky, elements } = build(2, 2)
    sticky.update(120)
    expect(elements.get(0)?.style.translate).toBe('0px 120px')

    sticky.refresh()

    expect(elements.get(0)?.style.translate).toBe('')
    expect(sticky.pinnedIndex()).toBeUndefined()
  })

  it('clears the pinned header on release', () => {
    const { sticky, elements } = build(2, 2)
    sticky.update(120)

    sticky.release()

    expect(sticky.pinnedIndex()).toBeUndefined()
    expect(elements.get(0)?.style.translate).toBe('')
  })

  it('pins nothing when the items carry no headers', () => {
    const engine = createEngine({
      algorithm: masonry({ columns: 1 }),
      viewport: { width: 100, height: 300 },
      items: [{ id: 1, height: 100, width: 100 }],
    })
    const sticky = createStickyHeaders({
      engine,
      isHeader,
      elementOf: () => undefined,
    })
    sticky.refresh()
    sticky.update(50)

    expect(sticky.pinnedIndex()).toBeUndefined()
  })
})
