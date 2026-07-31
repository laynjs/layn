import { type NoSerialize, noSerialize, useSignal, useVisibleTask$ } from '@builder.io/qwik'
import type { EngineStore } from '@laynjs/adapter-utils'
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
  type LayoutAlgorithm,
  type LayoutEngine,
  type LayoutItem,
  type Size,
} from '@laynjs/core'
import { type BindOptions, bindEngine, type EngineBinding } from '@laynjs/dom'
import { buildItems } from '../items/index.js'
import type { LaynItem, UseLaynOptions, UseLaynResult } from '../types/index.js'

export const useLayn = <TData = unknown>(options: UseLaynOptions<TData>): UseLaynResult<TData> => {
  const axis = options.axis ?? 'vertical'
  const overscan = options.overscan ?? 0
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
  const initial = store.getState()

  const engineRef = useSignal<NoSerialize<LayoutEngine>>(noSerialize(engine))
  const storeRef = useSignal<NoSerialize<EngineStore>>(noSerialize(store))
  const bindingRef = useSignal<NoSerialize<EngineBinding>>()
  const itemsRef = useSignal<NoSerialize<readonly LayoutItem<TData>[]>>(noSerialize(options.items))
  const containerRef = useSignal<Element>()

  const items = useSignal<readonly LaynItem<TData>[]>(
    buildItems(options.items, initial.snapshot, initial.visible),
  )
  const contentStyle = useSignal<Record<string, string>>(
    contentStyleObject(initial.snapshot.contentSize),
  )
  const totalSize = useSignal<Size>(initial.snapshot.contentSize)

  useVisibleTask$(({ cleanup }) => {
    const activeEngine = engineRef.value
    const activeStore = storeRef.value
    const container = containerRef.value
    if (activeEngine === undefined || activeStore === undefined) {
      return
    }
    const update = (): void => {
      const state = activeStore.getState()
      items.value = buildItems(itemsRef.value ?? [], state.snapshot, state.visible)
      contentStyle.value = contentStyleObject(state.snapshot.contentSize)
      totalSize.value = state.snapshot.contentSize
    }
    const unsubscribe = activeStore.subscribe(update)
    if (container instanceof HTMLElement) {
      const targets = resolveBindTargets(scroll, container)
      const bindOptions: BindOptions = {
        scroll: targets.scroll,
        axis,
        overscan,
        ...(targets.origin !== undefined ? { origin: targets.origin } : {}),
        ...(options.environment !== undefined ? { environment: options.environment } : {}),
      }
      const binding = bindEngine(activeEngine, bindOptions)
      bindingRef.value = noSerialize(binding)
      activeStore.attach(binding)
    }
    update()
    cleanup(() => {
      unsubscribe()
      bindingRef.value?.destroy()
      activeStore.destroy()
    })
  })

  return {
    containerRef,
    containerStyle: containerStyleObject(scroll),
    containerAttrs: containerAttrs(options.label),
    contentAttrs: contentAria(),
    items,
    contentStyle,
    totalSize,
    setItems: (next) => {
      itemsRef.value = noSerialize(next)
      const activeEngine = engineRef.value
      if (
        activeEngine !== undefined &&
        diffItems(activeEngine.getSnapshot().items, next).kind !== 'identical'
      ) {
        activeEngine.setItems(next)
      }
    },
    setAlgorithm: (algorithm: LayoutAlgorithm) => engineRef.value?.setAlgorithm(algorithm),
    setGap: (gap: Gap | undefined) => engineRef.value?.setGap({ x: gap?.x ?? 0, y: gap?.y ?? 0 }),
    scrollToIndex: (index, scrollOptions) => bindingRef.value?.scrollToIndex(index, scrollOptions),
    scrollToItem: (id, scrollOptions) => bindingRef.value?.scrollToItem(id, scrollOptions),
  }
}
