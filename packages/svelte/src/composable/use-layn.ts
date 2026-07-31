import {
  applyRectStyle,
  containerAttrs,
  contentAria,
  contentStyleObject,
  createStore,
  resolveEngineConfig,
} from '@laynjs/adapter-utils'
import {
  createEngine,
  diffItems,
  type Gap,
  type LayoutAlgorithm,
  type LayoutItem,
} from '@laynjs/core'
import { type BindOptions, bindEngine, type EngineBinding } from '@laynjs/dom'
import { onDestroy, onMount } from 'svelte'
import type { Action } from 'svelte/action'
import { derived, writable } from 'svelte/store'
import { buildItems } from '../items/index.js'
import type { ItemActionParams, UseLaynOptions, UseLaynResult } from '../types/index.js'

const containerStyle: Record<string, string> = { position: 'relative', overflow: 'auto' }

export const useLayn = <TData = unknown>(options: UseLaynOptions<TData>): UseLaynResult<TData> => {
  const axis = options.axis ?? 'vertical'
  const overscan = options.overscan ?? 0
  const environment = options.environment
  const animate = options.animate

  const engine = createEngine(
    resolveEngineConfig({
      algorithm: options.algorithm,
      items: options.items,
      gap: options.gap,
      viewport: options.viewport,
      measurements: options.measurements,
    }),
  )
  const store = createStore(engine, axis, overscan)
  const state = writable(store.getState())
  const unsubscribe = store.subscribe(() => state.set(store.getState()))

  let binding: EngineBinding | undefined
  let containerNode: HTMLElement | undefined
  let currentItems: readonly LayoutItem<TData>[] = options.items

  const container: Action<HTMLElement> = (node) => {
    containerNode = node
    return {
      destroy: () => {
        binding?.destroy()
        binding = undefined
      },
    }
  }

  const item: Action<HTMLElement, ItemActionParams> = (node, params) => {
    let current = params
    applyRectStyle(node, current.rect)
    binding?.observeItem(current.id, node)
    return {
      update: (next) => {
        current = next
        applyRectStyle(node, current.rect)
      },
      destroy: () => binding?.unobserveItem(current.id),
    }
  }

  onMount(() => {
    if (containerNode === undefined) {
      return
    }
    const bindOptions: BindOptions = {
      scroll: containerNode,
      axis,
      overscan,
      ...(animate !== undefined ? { animate } : {}),
      ...(environment !== undefined ? { environment } : {}),
    }
    binding = bindEngine(engine, bindOptions)
    store.attach(binding)
  })

  onDestroy(() => {
    unsubscribe()
    binding?.destroy()
    store.destroy()
  })

  return {
    container,
    containerStyle,
    containerAttrs: containerAttrs(options.label),
    contentAttrs: contentAria(),
    item,
    contentStyle: derived(state, ({ snapshot }) => contentStyleObject(snapshot.contentSize)),
    items: derived(state, ({ snapshot, visible }) => buildItems(currentItems, snapshot, visible)),
    totalSize: derived(state, ({ snapshot }) => snapshot.contentSize),
    engine,
    setItems: (items) => {
      currentItems = items
      if (diffItems(engine.getSnapshot().items, items).kind !== 'identical') {
        engine.setItems(items)
      }
    },
    setAlgorithm: (algorithm: LayoutAlgorithm) => engine.setAlgorithm(algorithm),
    setGap: (gap: Gap | undefined) => engine.setGap({ x: gap?.x ?? 0, y: gap?.y ?? 0 }),
  }
}
