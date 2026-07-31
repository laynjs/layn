import {
  containerAttrs,
  contentAria,
  contentStyleObject,
  createStore,
  resolveEngineConfig,
} from '@laynjs/adapter-utils'
import { createEngine, diffItems, type ItemId } from '@laynjs/core'
import { type BindOptions, bindEngine, type EngineBinding } from '@laynjs/dom'
import { computed, onBeforeUnmount, shallowRef, toValue, watch } from 'vue'
import { buildItems } from '../items/index.js'
import type { LaynElementRef, UseLaynOptions, UseLaynResult } from '../types/index.js'

const containerStyle: Record<string, string> = { position: 'relative', overflow: 'auto' }

export const useLayn = <TData = unknown>(options: UseLaynOptions<TData>): UseLaynResult<TData> => {
  const axis = options.axis ?? 'vertical'
  const overscan = options.overscan ?? 0
  const environment = options.environment
  const animate = options.animate

  const engine = createEngine(
    resolveEngineConfig({
      algorithm: toValue(options.algorithm),
      items: toValue(options.items),
      gap: toValue(options.gap),
      viewport: options.viewport,
      measurements: options.measurements,
    }),
  )
  const store = createStore(engine, axis, overscan)

  const state = shallowRef(store.getState())
  const unsubscribe = store.subscribe(() => {
    state.value = store.getState()
  })

  let binding: EngineBinding | undefined
  const refCache = new Map<ItemId, LaynElementRef>()
  const refFor = (id: ItemId): LaynElementRef => {
    const existing = refCache.get(id)
    if (existing !== undefined) {
      return existing
    }
    const ref: LaynElementRef = (element) => {
      if (element instanceof Element) {
        binding?.observeItem(id, element)
      } else {
        binding?.unobserveItem(id)
      }
    }
    refCache.set(id, ref)
    return ref
  }

  watch(
    () => toValue(options.algorithm),
    (algorithm) => engine.setAlgorithm(algorithm),
  )
  watch(
    () => toValue(options.gap),
    (gap) => engine.setGap({ x: gap?.x ?? 0, y: gap?.y ?? 0 }),
  )
  watch(
    () => toValue(options.items),
    (items) => {
      if (diffItems(engine.getSnapshot().items, items).kind !== 'identical') {
        engine.setItems(items)
      }
    },
  )

  const containerRef: LaynElementRef = (element) => {
    if (!(element instanceof HTMLElement)) {
      binding?.destroy()
      binding = undefined
      return
    }
    const bindOptions: BindOptions = {
      scroll: element,
      axis,
      overscan,
      ...(animate !== undefined ? { animate } : {}),
      ...(environment !== undefined ? { environment } : {}),
    }
    binding = bindEngine(engine, bindOptions)
    store.attach(binding)
  }

  onBeforeUnmount(() => {
    binding?.destroy()
    store.destroy()
    unsubscribe()
  })

  return {
    containerRef,
    containerStyle,
    containerAttrs: containerAttrs(options.label),
    contentAttrs: contentAria(),
    contentStyle: computed(() => contentStyleObject(state.value.snapshot.contentSize)),
    items: computed(() =>
      buildItems(toValue(options.items), state.value.snapshot, state.value.visible, refFor),
    ),
    totalSize: computed(() => state.value.snapshot.contentSize),
    engine,
  }
}
