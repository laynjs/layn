import {
  containerAttrs,
  containerStyleObject,
  contentAria,
  contentStyleObject,
  createStore,
  resolveBindTargets,
  resolveEngineConfig,
} from '@laynjs/adapter-utils'
import { createEngine, diffItems, type ItemId } from '@laynjs/core'
import { type BindOptions, bindEngine, type DragOptions, type EngineBinding } from '@laynjs/dom'
import { computed, onBeforeUnmount, shallowRef, toValue, watch } from 'vue'
import { buildItems } from '../items/index.js'
import type { LaynElementRef, UseLaynOptions, UseLaynResult } from '../types/index.js'

/**
 * Lays out `items` and exposes only the ones on screen, already positioned.
 *
 * Reactive inputs are accepted as refs, getters or plain values, and the engine is created eagerly
 * so a server render is fully positioned. The binding attaches when `containerRef` runs on mount.
 */
export const useLayn = <TData = unknown>(options: UseLaynOptions<TData>): UseLaynResult<TData> => {
  const axis = options.axis ?? 'vertical'
  const overscan = options.overscan ?? 0
  const environment = options.environment
  const animate = options.animate
  const onReachEnd = options.onReachEnd
  const reachEndThreshold = options.reachEndThreshold
  const drag: DragOptions | undefined =
    options.onReorder === undefined
      ? undefined
      : {
          onReorder: options.onReorder,
          ...(options.onDragStart !== undefined ? { onDragStart: options.onDragStart } : {}),
          ...(options.onDragEnd !== undefined ? { onDragEnd: options.onDragEnd } : {}),
        }
  const scroll = options.scroll

  const engine = createEngine(
    resolveEngineConfig({
      algorithm: toValue(options.algorithm),
      items: toValue(options.items),
      gap: toValue(options.gap),
      viewport: options.viewport,
      measurements: options.measurements,
      direction: options.direction,
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
        store.observeItem(id, element)
      } else {
        store.unobserveItem(id)
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
    const targets = resolveBindTargets(scroll, element)
    const bindOptions: BindOptions = {
      scroll: targets.scroll,
      axis,
      overscan,
      ...(targets.origin !== undefined ? { origin: targets.origin } : {}),
      ...(animate !== undefined ? { animate } : {}),

      ...(onReachEnd !== undefined ? { onReachEnd } : {}),
      ...(reachEndThreshold !== undefined ? { reachEndThreshold } : {}),
      ...(options.stickyHeaders !== undefined ? { stickyHeaders: options.stickyHeaders } : {}),
      ...(drag !== undefined ? { drag } : {}),
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
    containerStyle: containerStyleObject(scroll),
    containerAttrs: containerAttrs(options.label),
    contentAttrs: contentAria(),
    contentStyle: computed(() => contentStyleObject(state.value.snapshot.contentSize)),
    items: computed(() =>
      buildItems(toValue(options.items), state.value.snapshot, state.value.visible, refFor),
    ),
    totalSize: computed(() => state.value.snapshot.contentSize),
    engine,
    scrollToIndex: (index, scrollOptions) => binding?.scrollToIndex(index, scrollOptions),
    scrollToItem: (id, scrollOptions) => binding?.scrollToItem(id, scrollOptions),
    startDrag: (id, event) => binding?.startDrag(id, event),
  }
}
