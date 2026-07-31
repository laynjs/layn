import { useLayn } from '@laynjs/react'
import { type MutableRefObject, useEffect, useMemo } from 'react'
import { type AlgoSpec, makeTiles, toneOf } from '../lib/layouts'
import type { Settings } from '../lib/settings'

interface GridProps {
  spec: AlgoSpec
  settings: Settings
  scrollApi: MutableRefObject<((id: number) => void) | undefined>
}

export function Grid({ spec, settings, scrollApi }: GridProps) {
  const { columns, size, gap, count, overscan, showImages, animate, shuffleSeed, prepended } =
    settings
  const algorithm = useMemo(() => spec.make({ columns, size }), [spec, columns, size])
  const items = useMemo(
    () => makeTiles(count, shuffleSeed, prepended),
    [count, shuffleSeed, prepended],
  )

  const layn = useLayn({
    items,
    algorithm,
    gap: { x: gap, y: gap },
    axis: spec.axis,
    overscan,
    animate,
    label: `${spec.label} layout`,
  })

  useEffect(() => {
    scrollApi.current = (id) => layn.scrollToItem(id, { align: 'center', behavior: 'smooth' })
    return () => {
      scrollApi.current = undefined
    }
  }, [scrollApi, layn.scrollToItem])

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
              <img className="tile-img" src={entry.item.data?.src} alt="" decoding="async" />
            </div>
          ) : (
            <div
              key={entry.id}
              ref={entry.ref}
              className={`tile tone-${toneOf(entry.index)}`}
              {...entry.a11y}
              style={entry.style}
            >
              <span className="tile-num">{entry.item.data?.label}</span>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
