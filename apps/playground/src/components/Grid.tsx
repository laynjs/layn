import type { ItemId } from '@laynjs/core'
import { sections } from '@laynjs/core'
import { useLayn } from '@laynjs/react'
import { type CSSProperties, type MutableRefObject, useEffect, useMemo, useState } from 'react'
import { RESPONSIVE_COLUMNS } from '../lib/constants'
import { type AlgoSpec, isHeader, makeTiles, toneOf } from '../lib/layouts'
import type { Settings } from '../lib/settings'

interface GridProps {
  spec: AlgoSpec
  settings: Settings
  scrollApi: MutableRefObject<((id: number) => void) | undefined>
  onRendered: (count: number) => void
  onLoadMore: () => void
}

export function Grid({ spec, settings, scrollApi, onRendered, onLoadMore }: GridProps) {
  const { columns, size, gap, count, overscan, showImages, animate, shuffleSeed, prepended } =
    settings
  const total = count + settings.loaded
  const tracks = settings.responsive ? RESPONSIVE_COLUMNS : columns
  const grouped = settings.sections && spec.axis === 'vertical'
  const algorithm = useMemo(() => {
    const base = spec.make({ columns: tracks, size })
    return grouped ? sections(base, { isHeader }) : base
  }, [spec, tracks, size, grouped])
  const heroEvery = spec.usesSpan ? settings.heroEvery : 0
  const base = useMemo(
    () => makeTiles(total, shuffleSeed, prepended, settings.removed, heroEvery, grouped),
    [total, shuffleSeed, prepended, settings.removed, heroEvery, grouped],
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
    ...(settings.rtl ? { direction: 'rtl' as const } : {}),
    label: `${spec.label} layout`,
    ...(settings.infinite ? { onReachEnd: onLoadMore } : {}),
    ...(settings.reorder ? { onReorder: reorder } : {}),
    ...(grouped ? { stickyHeaders: isHeader } : {}),
  })

  useEffect(() => {
    scrollApi.current = (id) => layn.scrollToItem(id, { align: 'center', behavior: 'smooth' })
    return () => {
      scrollApi.current = undefined
    }
  }, [scrollApi, layn.scrollToItem])

  useEffect(() => {
    onRendered(layn.items.length)
  }, [onRendered, layn.items.length])

  const scrollClass = spec.axis === 'horizontal' ? 'grid-scroll horizontal' : 'grid-scroll'
  const tileClass = settings.reorder ? 'tile draggable' : 'tile'
  const tileStyle = (style: CSSProperties): CSSProperties => ({
    ...style,
    borderRadius: settings.radius,
  })
  const dragProps = (id: ItemId) =>
    settings.reorder
      ? { onPointerDown: (event: React.PointerEvent) => layn.startDrag(id, event.nativeEvent) }
      : {}

  return (
    <div {...layn.containerProps} className={scrollClass}>
      <div {...layn.contentProps}>
        {layn.items.map((entry) =>
          entry.item.data?.header === true ? (
            <div
              key={entry.id}
              ref={entry.ref}
              className="tile-header"
              {...entry.a11y}
              style={entry.style}
            >
              <span>{entry.item.data.label}</span>
            </div>
          ) : showImages ? (
            <div
              key={entry.id}
              ref={entry.ref}
              className={tileClass}
              {...dragProps(entry.id)}
              {...entry.a11y}
              style={tileStyle(entry.style)}
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
              style={tileStyle(entry.style)}
            >
              <span className="tile-num">{entry.item.data?.label}</span>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
