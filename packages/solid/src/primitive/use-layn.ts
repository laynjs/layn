import {
  applyRectStyle,
  containerAttrs,
  contentAria,
  contentStyleObject,
  createStore,
  resolveEngineConfig,
} from '@laynjs/adapter-utils'
import { createEngine, diffItems, type ItemId, type Rect } from '@laynjs/core'
import { type BindOptions, bindEngine, type EngineBinding } from '@laynjs/dom'
import { type Accessor, createEffect, createSignal, type JSX, onCleanup, onMount } from 'solid-js'
import { createItemBuilder } from '../items/index.js'
import type {
  LaynElementRef,
  MaybeAccessor,
  UseLaynOptions,
  UseLaynResult,
} from '../types/index.js'

const containerStyle: JSX.CSSProperties = { position: 'relative', overflow: 'auto' }

const access = <T>(value: MaybeAccessor<T>): T =>
  typeof value === 'function' ? (value as Accessor<T>)() : value

export const useLayn = <TData = unknown>(options: UseLaynOptions<TData>): UseLaynResult<TData> => {
  const axis = options.axis ?? 'vertical'
  const overscan = options.overscan ?? 0
  const environment = options.environment
  const animate = options.animate

  const engine = createEngine(
    resolveEngineConfig({
      algorithm: access(options.algorithm),
      items: access(options.items),
      gap: access(options.gap),
      viewport: options.viewport,
      measurements: options.measurements,
    }),
  )
  const store = createStore(engine, axis, overscan)
  const [state, setState] = createSignal(store.getState())
  const unsubscribe = store.subscribe(() => setState(store.getState()))

  let binding: EngineBinding | undefined
  const makeRef =
    (id: ItemId, rect: Rect): LaynElementRef =>
    (element) => {
      if (element instanceof HTMLElement) {
        applyRectStyle(element, rect)
      }
      binding?.observeItem(id, element)
      onCleanup(() => binding?.unobserveItem(id))
    }
  const build = createItemBuilder<TData>(makeRef)

  createEffect(() => engine.setAlgorithm(access(options.algorithm)))
  createEffect(() => {
    const gap = access(options.gap)
    engine.setGap({ x: gap?.x ?? 0, y: gap?.y ?? 0 })
  })
  createEffect(() => {
    const items = access(options.items)
    if (diffItems(engine.getSnapshot().items, items).kind !== 'identical') {
      engine.setItems(items)
    }
  })

  let container: HTMLElement | undefined
  const containerRef: LaynElementRef = (element) => {
    if (element instanceof HTMLElement) {
      container = element
    }
  }

  onMount(() => {
    if (container === undefined) {
      return
    }
    const bindOptions: BindOptions = {
      scroll: container,
      axis,
      overscan,
      ...(animate !== undefined ? { animate } : {}),
      ...(environment !== undefined ? { environment } : {}),
    }
    binding = bindEngine(engine, bindOptions)
    store.attach(binding)
  })

  onCleanup(() => {
    unsubscribe()
    binding?.destroy()
    store.destroy()
  })

  return {
    containerRef,
    containerStyle,
    containerAttrs: containerAttrs(options.label),
    contentAttrs: contentAria(),
    contentStyle: () => contentStyleObject(state().snapshot.contentSize),
    items: () => build(access(options.items), state().snapshot, state().visible),
    totalSize: () => state().snapshot.contentSize,
    engine,
  }
}
