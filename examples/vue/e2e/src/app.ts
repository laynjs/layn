import { masonry } from '@laynjs/core'
import { useLayn } from '@laynjs/vue'
import { defineComponent, h } from 'vue'

const items = Array.from({ length: 500 }, (_, index) => ({
  id: index,
  aspectRatio: 1,
  data: index,
}))

export const App = defineComponent({
  name: 'LaynVueE2E',
  setup() {
    const view = useLayn({
      algorithm: masonry({ columns: 3 }),
      items,
      gap: { x: 8, y: 8 },
      viewport: { width: 900, height: 600 },
      overscan: 200,
    })

    return () =>
      h(
        'div',
        {
          ref: view.containerRef,
          'data-testid': 'container',
          style: { ...view.containerStyle, width: '900px', height: '600px' },
        },
        [
          h(
            'div',
            { 'data-testid': 'content', style: view.contentStyle.value },
            view.items.value.map((entry) =>
              h(
                'div',
                {
                  key: entry.id,
                  'data-testid': 'item',
                  'data-id': String(entry.id),
                  style: { ...entry.style, background: '#dddddd' },
                },
                String(entry.item.data),
              ),
            ),
          ),
        ],
      )
  },
})
