import { component$ } from '@builder.io/qwik'
import { masonry } from '@laynjs/core'
import { useLayn } from '@laynjs/qwik'

const data = Array.from({ length: 500 }, (_, index) => ({
  id: index,
  aspectRatio: 1,
  data: index,
}))

export const App = component$(() => {
  const view = useLayn<number>({
    algorithm: masonry({ columns: 3 }),
    items: data,
    gap: { x: 8, y: 8 },
    viewport: { width: 900, height: 600 },
    overscan: 200,
  })

  return (
    <div
      ref={view.containerRef}
      data-testid="container"
      style={{ ...view.containerStyle, width: '900px', height: '600px' }}
    >
      <div data-testid="content" style={view.contentStyle.value}>
        {view.items.value.map((entry) => (
          <div
            key={entry.id}
            data-testid="item"
            data-id={String(entry.id)}
            style={{ ...entry.style, background: '#dddddd' }}
          >
            {entry.item.data}
          </div>
        ))}
      </div>
    </div>
  )
})
