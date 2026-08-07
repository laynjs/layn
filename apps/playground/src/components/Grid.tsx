import type { ItemId } from '@laynjs/core'
import { useLayn } from '@laynjs/react'
import { type MutableRefObject, useEffect, useMemo, useState } from 'react'
import { type AlgoSpec, makeTiles, toneOf } from '../lib/layouts'
import type { Settings } from '../lib/settings'

interface GridProps {
  spec: AlgoSpec
  settings: Settings
  scrollApi: MutableRefObject<((id: number) => void) | undefined>
  onLoadMore: () => void
}

export function Grid({ spec, settings, scrollApi, onLoadMore }: GridProps) {
  const { columns, size, gap, count, overscan, showImages, animate, shuffleSeed, prepended } =
    settings
  const total = count + settings.loaded
  const algorithm = useMemo(() => spec.make({ columns, size }), [spec, columns, size])
  const base = useMemo(
    () => makeTiles(total, shuffleSeed, prepended, settings.removed),
    [total, shuffleSeed, prepended, settings.removed],
  )
  const [items, setItems] = useState(base)
  useEffect(() => {
    setItems(base)
  }, [base])

  const reorder = (from: number, to: number) =>
    setItems((current) => {
      const next = [...current]
      const [moved] = next.splice(from, 1)
      if (moved !== undefined) {
        next.splice(to, 0, moved)
      }
      return next
    })

  const layn = useLayn({
    items,
    algorithm,
    gap: { x: gap, y: gap },
    axis: spec.axis,
    overscan,
    animate,
    label: `${spec.label} layout`,
    ...(settings.infinite ? { onReachEnd: onLoadMore } : {}),
    ...(settings.reorder ? { onReorder: reorder } : {}),
  })

  useEffect(() => {
    scrollApi.current = (id) => layn.scrollToItem(id, { align: 'center', behavior: 'smooth' })
    return () => {
      scrollApi.current = undefined
    }
  }, [scrollApi, layn.scrollToItem])

  const scrollClass = spec.axis === 'horizontal' ? 'grid-scroll horizontal' : 'grid-scroll'
  const tileClass = settings.reorder ? 'tile draggable' : 'tile'
  const dragProps = (id: ItemId) =>
    settings.reorder
      ? { onPointerDown: (event: React.PointerEvent) => layn.startDrag(id, event.nativeEvent) }
      : {}

  return (
    <div {...layn.containerProps} className={scrollClass}>
      <div {...layn.contentProps}>
        {layn.items.map((entry) =>
          showImages ? (
            <div
              key={entry.id}
              ref={entry.ref}
              className={tileClass}
              {...dragProps(entry.id)}
              {...entry.a11y}
              style={entry.style}
            >
              <img className="tile-img" src={entry.item.data?.src} alt="" decoding="async" />
            </div>
          ) : (
            <div
              key={entry.id}
              ref={entry.ref}
              className={`${tileClass} tone-${toneOf(entry.index)}`}
              {...dragProps(entry.id)}
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
