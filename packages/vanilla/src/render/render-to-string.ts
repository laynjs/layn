import { contentAria, itemAria, mapVisible, resolveEngineConfig } from '@laynjs/adapter-utils'
import { createEngine } from '@laynjs/core'
import { CONTENT_ATTR, ITEM_ID_ATTR } from '../constants.js'
import { attrsString, contentStyleString, rectStyleString } from '../style/index.js'
import type { RenderOptions } from '../types/index.js'

const escapeAttr = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

export const renderToString = <TData>(options: RenderOptions<TData>): string => {
  const axis = options.axis ?? 'vertical'
  const engine = createEngine(
    resolveEngineConfig({
      algorithm: options.algorithm,
      items: options.items,
      gap: options.gap,
      viewport: options.viewport,
      measurements: options.measurements,
    }),
  )
  const snapshot = engine.getSnapshot()
  const size = axis === 'vertical' ? snapshot.viewport.height : snapshot.viewport.width
  const visible = engine.getVisible({ start: 0, size }, { axis, overscan: options.overscan ?? 0 })

  const total = options.items.length
  const cells = mapVisible(options.items, snapshot, visible, (item, index, rect) => {
    const content = options.renderItem !== undefined ? options.renderItem(item) : ''
    return `<div ${ITEM_ID_ATTR}="${escapeAttr(String(item.id))}" ${attrsString(itemAria(index, total))} style="${rectStyleString(rect)}">${content}</div>`
  })

  return `<div ${CONTENT_ATTR} ${attrsString(contentAria())} style="${contentStyleString(snapshot.contentSize)}">${cells.join('')}</div>`
}
