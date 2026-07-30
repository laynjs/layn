import { useLayn } from '@laynjs/react'
import { useMemo } from 'react'
import { type AlgoSpec, hue, makeTiles } from '../lib/layouts'
import type { Settings } from '../lib/settings'

interface GridProps {
  spec: AlgoSpec
  settings: Settings
}

export function Grid({ spec, settings }: GridProps) {
  const { columns, size, gap, count, overscan, showImages } = settings
  const algorithm = useMemo(() => spec.make({ columns, size }), [spec, columns, size])
  const items = useMemo(() => makeTiles(count), [count])

  const layn = useLayn({
    items,
    algorithm,
    gap: { x: gap, y: gap },
    axis: spec.axis,
    overscan,
    label: `${spec.label} layout`,
  })

  const scrollClass = spec.axis === 'horizontal' ? 'grid-scroll horizontal' : 'grid-scroll'

  return (
    <div {...layn.containerProps} className={scrollClass}>
      <div {...layn.contentProps}>
        {layn.items.map((entry) =>
          showImages ? (
            <div
              key={entry.id}
              ref={entry.ref}
              className="tile"
              {...entry.a11y}
              style={entry.style}
            >
              <img className="tile-img" src={entry.item.data} alt="" decoding="async" />
            </div>
          ) : (
            <div
              key={entry.id}
              ref={entry.ref}
              className="tile"
              {...entry.a11y}
              style={{ ...entry.style, background: `hsl(${hue(entry.index)} 62% 62%)` }}
            />
          ),
        )}
      </div>
    </div>
  )
}
