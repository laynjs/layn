import { computed, DestroyRef, inject, signal } from '@angular/core'
import {
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
  type ItemId,
  type LayoutAlgorithm,
  type LayoutItem,
} from '@laynjs/core'
import { type BindOptions, bindEngine, type EngineBinding } from '@laynjs/dom'
import { buildItems } from '../items/index.js'
import type { LaynRef, UseLaynOptions } from '../types/index.js'

const containerStyle: Record<string, string> = { position: 'relative', overflow: 'auto' }

export const useLayn = <TData = unknown>(options: UseLaynOptions<TData>): LaynRef<TData> => {
  const destroyRef = inject(DestroyRef)
  const axis = options.axis ?? 'vertical'
  const overscan = options.overscan ?? 0
  const environment = options.environment

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
  const state = signal(store.getState())
  const unsubscribe = store.subscribe(() => state.set(store.getState()))

  let binding: EngineBinding | undefined
  let currentItems: readonly LayoutItem<TData>[] = options.items

  destroyRef.onDestroy(() => {
    unsubscribe()
    binding?.destroy()
    store.destroy()
  })

  return {
    items: computed(() => buildItems(currentItems, state().snapshot, state().visible)),
    contentStyle: computed(() => contentStyleObject(state().snapshot.contentSize)),
    totalSize: computed(() => state().snapshot.contentSize),
    containerStyle,
    containerAttrs: containerAttrs(options.label),
    contentAttrs: contentAria(),
    engine,
    attachContainer: (element: HTMLElement) => {
      const bindOptions: BindOptions = {
        scroll: element,
        axis,
        overscan,
        ...(environment !== undefined ? { environment } : {}),
      }
      binding = bindEngine(engine, bindOptions)
      store.attach(binding)
    },
    observeItem: (id: ItemId, element: HTMLElement) => binding?.observeItem(id, element),
    unobserveItem: (id: ItemId) => binding?.unobserveItem(id),
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
