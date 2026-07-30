import { masonry } from '@laynjs/core'
import { useLayn } from '@laynjs/solid'
import { For } from 'solid-js'

const items = Array.from({ length: 500 }, (_, index) => ({
  id: index,
  aspectRatio: 1,
  data: index,
}))

export function App() {
  const view = useLayn<number>({
    algorithm: masonry({ columns: 3 }),
    items,
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
      <div data-testid="content" style={view.contentStyle()}>
        <For each={view.items()}>
          {(entry) => (
            <div
              data-testid="item"
              data-id={String(entry.id)}
              ref={entry.ref}
              style={{ ...entry.style, background: '#dddddd' }}
            >
              {entry.item.data}
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
