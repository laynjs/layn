import { masonry } from '@laynjs/core'
import { useLayn } from '@laynjs/react'
import { useState } from 'react'

const initialItems = Array.from({ length: 500 }, (_, index) => ({
  id: index,
  aspectRatio: 1,
  data: index,
}))

export function App() {
  const [items, setItems] = useState(initialItems)
  const view = useLayn({
    algorithm: masonry({ columns: 3 }),
    items,
    gap: { x: 8, y: 8 },
    viewport: { width: 900, height: 600 },
    overscan: 200,
    animate: true,
    label: 'Gallery',
  })

  const reverse = () => setItems((current) => [...current].reverse())
  const prepend = () =>
    setItems((current) => {
      const nextId = Math.max(...current.map((item) => item.id)) + 1
      const added = Array.from({ length: 3 }, (_, index) => ({
        id: nextId + index,
        aspectRatio: 1,
        data: nextId + index,
      }))
      return [...added, ...current]
    })

  return (
    <div>
      <button type="button" data-testid="reverse" onClick={reverse}>
        reverse
      </button>
      <button type="button" data-testid="prepend" onClick={prepend}>
        prepend
      </button>
      <button
        type="button"
        data-testid="jump"
        onClick={() => view.scrollToItem(400, { align: 'center' })}
      >
        jump
      </button>
      <div
        {...view.containerProps}
        data-testid="container"
        style={{ ...view.containerProps.style, width: 900, height: 600 }}
      >
        <div {...view.contentProps} data-testid="content">
          {view.items.map((entry) => (
            <div
              key={entry.id}
              ref={entry.ref}
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
    </div>
  )
}
