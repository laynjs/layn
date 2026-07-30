import { type LayoutItem, masonry } from '@laynjs/core'
import { createElement, type FunctionComponent } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { useLayn } from './use-layn.js'

const squares = (count: number): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({ id: index, aspectRatio: 1 }))

const Grid: FunctionComponent = () => {
  const { containerProps, contentProps, items } = useLayn({
    algorithm: masonry({ columns: 2 }),
    items: squares(4),
    gap: { x: 10, y: 10 },
    viewport: { width: 320, height: 800 },
    label: 'Photos',
  })

  return createElement(
    'div',
    containerProps,
    createElement(
      'div',
      contentProps,
      items.map((entry) =>
        createElement(
          'div',
          { key: entry.id, style: entry.style, ...entry.a11y },
          String(entry.id),
        ),
      ),
    ),
  )
}

describe('useLayn (SSR)', () => {
  it('server-renders every item at its data-driven position', () => {
    const html = renderToString(createElement(Grid))

    expect(html).toContain('translate(0px, 0px)')
    expect(html).toContain('translate(165px, 0px)')
    expect(html).toContain('translate(0px, 165px)')
    expect(html).toContain('translate(165px, 165px)')
  })

  it('server-renders the accessibility contract for a virtualized region', () => {
    const html = renderToString(createElement(Grid))

    expect(html).toContain('role="region"')
    expect(html).toContain('aria-label="Photos"')
    expect(html).toContain('tabindex="0"')
    expect(html).toContain('role="list"')
    expect(html).toContain('role="listitem"')
    expect(html).toContain('aria-setsize="4"')
    expect(html).toContain('aria-posinset="1"')
    expect(html).toContain('aria-posinset="4"')
  })
})
