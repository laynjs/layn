import { masonry } from '@laynjs/core'
import { useLayn } from '@laynjs/react'

const items = Array.from({ length: 500 }, (_, index) => ({
  id: index,
  aspectRatio: 1,
  data: index,
}))

export function App() {
  const view = useLayn({
    algorithm: masonry({ columns: 3 }),
    items,
    gap: { x: 8, y: 8 },
    viewport: { width: 900, height: 600 },
    overscan: 200,
    label: 'Gallery',
  })

  return (
    <div
      {...view.containerProps}
      data-testid="container"
      style={{ ...view.containerProps.style, width: 900, height: 600 }}
    >
      <div {...view.contentProps} data-testid="content">
        {view.items.map((entry) => (
          <div
            key={entry.id}
            data-testid="item"
            data-id={entry.id}
            {...entry.a11y}
            style={{ ...entry.style, background: '#dddddd' }}
          >
            {entry.item.data}
          </div>
        ))}
      </div>
    </div>
  )
}
