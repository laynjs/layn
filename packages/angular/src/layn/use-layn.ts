import { computed, DestroyRef, inject, signal } from '@angular/core'
import {
  containerAttrs,
  containerStyleObject,
  contentAria,
  contentStyleObject,
  createStore,
  resolveBindTargets,
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

export const useLayn = <TData = unknown>(options: UseLaynOptions<TData>): LaynRef<TData> => {
  const destroyRef = inject(DestroyRef)
  const axis = options.axis ?? 'vertical'
  const overscan = options.overscan ?? 0
  const environment = options.environment
  const animate = options.animate
  const onReachEnd = options.onReachEnd
  const reachEndThreshold = options.reachEndThreshold
  const scroll = options.scroll

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
    containerStyle: containerStyleObject(scroll),
    containerAttrs: containerAttrs(options.label),
    contentAttrs: contentAria(),
    engine,
    attachContainer: (element: HTMLElement) => {
      const targets = resolveBindTargets(scroll, element)
      const bindOptions: BindOptions = {
        scroll: targets.scroll,
        axis,
        overscan,
        ...(targets.origin !== undefined ? { origin: targets.origin } : {}),
        ...(animate !== undefined ? { animate } : {}),

        ...(onReachEnd !== undefined ? { onReachEnd } : {}),
        ...(reachEndThreshold !== undefined ? { reachEndThreshold } : {}),
        ...(environment !== undefined ? { environment } : {}),
      }
      binding = bindEngine(engine, bindOptions)
      store.attach(binding)
    },
    observeItem: (id: ItemId, element: HTMLElement) => store.observeItem(id, element),
    unobserveItem: (id: ItemId) => store.unobserveItem(id),
    setItems: (items) => {
      currentItems = items
      if (diffItems(engine.getSnapshot().items, items).kind !== 'identical') {
        engine.setItems(items)
      }
    },
    setAlgorithm: (algorithm: LayoutAlgorithm) => engine.setAlgorithm(algorithm),
    setGap: (gap: Gap | undefined) => engine.setGap({ x: gap?.x ?? 0, y: gap?.y ?? 0 }),
    scrollToIndex: (index, scrollOptions) => binding?.scrollToIndex(index, scrollOptions),
    scrollToItem: (id, scrollOptions) => binding?.scrollToItem(id, scrollOptions),
  }
}
