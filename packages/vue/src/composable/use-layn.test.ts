import { type LayoutItem, masonry } from '@laynjs/core'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { useLayn } from './use-layn.js'

const squares = (count: number): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({ id: index, aspectRatio: 1 }))

const Grid = defineComponent({
  setup() {
    const view = useLayn({
      algorithm: masonry({ columns: 2 }),
      items: squares(4),
      gap: { x: 10, y: 10 },
      viewport: { width: 320, height: 800 },
      label: 'Photos',
    })
    return () =>
      h('div', { style: view.containerStyle, ...view.containerAttrs }, [
        h(
          'div',
          { style: view.contentStyle.value, ...view.contentAttrs },
          view.items.value.map((entry) =>
            h('div', { key: entry.id, style: entry.style, ...entry.a11y }, String(entry.id)),
          ),
        ),
      ])
  },
})

describe('useLayn (SSR)', () => {
  it('server-renders every item at its data-driven position', async () => {
    const html = await renderToString(createSSRApp(Grid))

    expect(html).toContain('translate(0px, 0px)')
    expect(html).toContain('translate(165px, 0px)')
    expect(html).toContain('translate(0px, 165px)')
    expect(html).toContain('translate(165px, 165px)')
  })

  it('server-renders the accessibility contract for a virtualized region', async () => {
    const html = await renderToString(createSSRApp(Grid))

    expect(html).toContain('role="region"')
    expect(html).toContain('aria-label="Photos"')
    expect(html).toContain('tabindex="0"')
    expect(html).toContain('role="list"')
    expect(html).toContain('role="listitem"')
    expect(html).toContain('aria-setsize="4"')
    expect(html).toContain('aria-posinset="1"')
  })
})
