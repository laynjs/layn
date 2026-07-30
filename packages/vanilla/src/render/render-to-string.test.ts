import { type LayoutItem, masonry } from '@laynjs/core'
import { describe, expect, it } from 'vitest'
import { renderToString } from './render-to-string.js'

const squares = (count: number): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({ id: index, aspectRatio: 1 }))

describe('renderToString', () => {
  it('emits a content wrapper and every item at its data-driven position', () => {
    const html = renderToString({
      algorithm: masonry({ columns: 2 }),
      items: squares(4),
      gap: { x: 10, y: 10 },
      viewport: { width: 320, height: 800 },
    })

    expect(html).toContain('data-layn-content')
    expect(html).toContain('data-layn-id="0"')
    expect(html).toContain('data-layn-id="3"')
    expect(html).toContain('translate(0px, 0px)')
    expect(html).toContain('translate(165px, 0px)')
    expect(html).toContain('translate(0px, 165px)')
    expect(html).toContain('translate(165px, 165px)')
  })

  it('emits the accessibility contract on the content wrapper and every item', () => {
    const html = renderToString({
      algorithm: masonry({ columns: 2 }),
      items: squares(4),
      viewport: { width: 320, height: 800 },
    })

    expect(html).toContain('data-layn-content role="list"')
    expect(html).toContain('role="listitem"')
    expect(html).toContain('aria-setsize="4"')
    expect(html).toContain('aria-posinset="1"')
    expect(html).toContain('aria-posinset="4"')
  })

  it('renders item content from renderItem and escapes ids', () => {
    const html = renderToString({
      algorithm: masonry({ columns: 1 }),
      items: [{ id: 'a"b', aspectRatio: 1 }],
      viewport: { width: 100, height: 100 },
      renderItem: (item) => `<span>${String(item.id)}</span>`,
    })

    expect(html).toContain('data-layn-id="a&quot;b"')
    expect(html).toContain('<span>a"b</span>')
  })
})
