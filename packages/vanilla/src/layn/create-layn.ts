import {
  applyAttrs,
  applyContentStyle,
  applyRectStyle,
  containerAttrs,
  contentAria,
  createStore,
  itemAria,
  mapVisible,
  resolveEngineConfig,
} from '@laynjs/adapter-utils'
import { createEngine, diffItems, type ItemId, type LayoutItem, type Rect } from '@laynjs/core'
import { bindEngine, type EngineBinding } from '@laynjs/dom'
import { CONTENT_ATTR, ITEM_ID_ATTR } from '../constants.js'
import type { LaynInstance, LaynOptions } from '../types/index.js'
import { bindOptionsFor } from './bind-options.js'

export const createLayn = <TData = unknown>(
  container: HTMLElement,
  options: LaynOptions<TData>,
): LaynInstance<TData> => {
  const axis = options.axis ?? 'vertical'
  const overscan = options.overscan ?? 0
  const renderItem = options.renderItem
  let items = options.items

  const engine = createEngine(
    resolveEngineConfig({
      algorithm: options.algorithm,
      items,
      gap: options.gap,
      viewport: options.viewport,
      measurements: options.measurements,
      direction: options.direction,
    }),
  )
  const store = createStore(engine, axis, overscan)

  container.style.position = 'relative'
  if (options.scroll !== 'window') {
    container.style.overflow = 'auto'
  }
  applyAttrs(container, containerAttrs(options.label))

  const existing = container.querySelector(`[${CONTENT_ATTR}]`)
  const content = existing instanceof HTMLElement ? existing : document.createElement('div')
  if (existing === null) {
    content.setAttribute(CONTENT_ATTR, '')
    container.appendChild(content)
  }
  applyAttrs(content, contentAria())

  const mounted = new Map<string, { element: HTMLElement; id: ItemId }>()
  const adopted = new Map<string, HTMLElement>()
  for (const child of Array.from(content.children)) {
    const key = child.getAttribute(ITEM_ID_ATTR)
    if (key !== null && child instanceof HTMLElement) {
      adopted.set(key, child)
    }
  }

  let binding: EngineBinding | undefined

  const mount = (item: LayoutItem<TData>, key: string, rect: Rect, index: number): void => {
    const reused = adopted.get(key)
    const element = reused ?? document.createElement('div')
    if (reused === undefined) {
      element.setAttribute(ITEM_ID_ATTR, key)
      renderItem?.(element, item)
      content.appendChild(element)
    } else {
      adopted.delete(key)
    }
    applyRectStyle(element, rect)
    applyAttrs(element, itemAria(index, items.length))
    store.observeItem(item.id, element)
    mounted.set(key, { element, id: item.id })
  }

  const render = (): void => {
    const state = store.getState()
    applyContentStyle(content, state.snapshot.contentSize)
    const next = new Set<string>()
    for (const cell of mapVisible(items, state.snapshot, state.visible, (item, index, rect) => ({
      item,
      rect,
      index,
    }))) {
      const key = String(cell.item.id)
      next.add(key)
      const existing = mounted.get(key)
      if (existing === undefined) {
        mount(cell.item, key, cell.rect, cell.index)
      } else {
        applyRectStyle(existing.element, cell.rect)
      }
    }
    for (const [key, entry] of mounted) {
      if (!next.has(key)) {
        store.unobserveItem(entry.id)
        entry.element.remove()
        mounted.delete(key)
      }
    }
  }

  binding = bindEngine(engine, bindOptionsFor(container, options, axis, overscan))
  store.attach(binding)
  const unsubscribe = store.subscribe(render)
  render()
  for (const [, element] of adopted) {
    element.remove()
  }
  adopted.clear()

  return {
    engine,
    setItems(next) {
      const changed = diffItems(engine.getSnapshot().items, next).kind !== 'identical'
      items = next
      if (changed) {
        engine.setItems(next)
      }
    },
    setAlgorithm: (algorithm) => engine.setAlgorithm(algorithm),
    setGap: (gap) => engine.setGap(gap),
    scrollToIndex: (index, scrollOptions) => binding?.scrollToIndex(index, scrollOptions),
    scrollToItem: (id, scrollOptions) => binding?.scrollToItem(id, scrollOptions),
    startDrag: (id, event) => binding?.startDrag(id, event),
    refresh: () => binding?.refresh(),
    destroy() {
      unsubscribe()
      binding?.destroy()
      store.destroy()
      for (const [, entry] of mounted) {
        entry.element.remove()
      }
      mounted.clear()
    },
  }
}
