import type { LayoutItem } from '@laynjs/core'
import { masonry } from '@laynjs/core'
import { useLayn } from '@laynjs/react'
import { useMemo, useState } from 'react'

const RATIOS = [0.7, 1, 1.4, 0.85, 1.2, 1.6, 0.6]

const makeTiles = (count: number, start = 0): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({
    id: start + index,
    aspectRatio: RATIOS[(start + index) % RATIOS.length] ?? 1,
  }))

const shuffle = (items: readonly LayoutItem[]): LayoutItem[] => {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = next[i]
    const b = next[j]
    if (a !== undefined && b !== undefined) {
      next[i] = b
      next[j] = a
    }
  }
  return next
}

export function App() {
  const [items, setItems] = useState(() => makeTiles(300))
  const algorithm = useMemo(() => masonry({ columns: { 0: 2, 700: 3, 1100: 4, 1500: 5 } }), [])

  const layn = useLayn({
    items,
    algorithm,
    gap: { x: 12, y: 12 },
    overscan: 300,
    animate: true,
    label: 'Tiles',
  })

  return (
    <main>
      <header>
        <strong>layn</strong>
        <span>
          {layn.items.length} of {items.length} rendered
        </span>
        <button type="button" onClick={() => setItems(shuffle)}>
          Shuffle
        </button>
        <button
          type="button"
          onClick={() => setItems((current) => [...current, ...makeTiles(100, current.length)])}
        >
          Add 100
        </button>
      </header>

      <div className="workspace">
        <div {...layn.containerProps} className="grid">
          <div {...layn.contentProps}>
            {layn.items.map((entry) => (
              <div
                key={entry.id}
                ref={entry.ref}
                style={{
                  ...entry.style,
                  background: `hsl(${200 + ((Number(entry.id) * 37) % 60)} 70% 55%)`,
                  borderRadius: 10,
                }}
                className="tile"
                {...entry.a11y}
              >
                {Number(entry.id) + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
