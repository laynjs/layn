import {
  CONTAINER_TAB_INDEX,
  containerAria,
  contentAria,
  createStore,
  resolveEngineConfig,
} from '@laynjs/adapter-utils'
import { createEngine, diffItems, type ItemId, type LayoutEngine } from '@laynjs/core'
import { type AnimateOption, type BindOptions, bindEngine, type EngineBinding } from '@laynjs/dom'
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react'
import { buildItems } from '../items/index.js'
import type { UseLaynOptions, UseLaynResult } from '../types/index.js'
import { useConstant } from './use-constant.js'

const containerStyle: CSSProperties = { position: 'relative', overflow: 'auto' }

const contentStyle = (width: number, height: number): CSSProperties => ({
  position: 'relative',
  width,
  height,
})

export const useLayn = <TData = unknown>(options: UseLaynOptions<TData>): UseLaynResult<TData> => {
  const axis = options.axis ?? 'vertical'
  const overscan = options.overscan ?? 0
  const environment = options.environment
  const animateEnabled = options.animate !== undefined && options.animate !== false
  const animateDuration = typeof options.animate === 'object' ? options.animate.duration : undefined
  const animateEasing = typeof options.animate === 'object' ? options.animate.easing : undefined
  const animate = useMemo<AnimateOption | undefined>(
    () =>
      animateEnabled
        ? {
            ...(animateDuration !== undefined ? { duration: animateDuration } : {}),
            ...(animateEasing !== undefined ? { easing: animateEasing } : {}),
          }
        : undefined,
    [animateEnabled, animateDuration, animateEasing],
  )

  const engine = useConstant<LayoutEngine>(() =>
    createEngine(
      resolveEngineConfig({
        algorithm: options.algorithm,
        items: options.items,
        gap: options.gap,
        viewport: options.viewport,
        measurements: options.measurements,
      }),
    ),
  )
  const store = useConstant(() => createStore(engine, axis, overscan))
  const bindingRef = useRef<EngineBinding | undefined>(undefined)
  const refCache = useConstant(() => new Map<ItemId, (element: HTMLElement | null) => void>())

  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState)

  useEffect(() => {
    engine.setAlgorithm(options.algorithm)
  }, [engine, options.algorithm])

  const gapX = options.gap?.x ?? 0
  const gapY = options.gap?.y ?? 0
  useEffect(() => {
    engine.setGap({ x: gapX, y: gapY })
  }, [engine, gapX, gapY])

  useEffect(() => {
    if (diffItems(engine.getSnapshot().items, options.items).kind !== 'identical') {
      engine.setItems(options.items)
    }
  }, [engine, options.items])

  useEffect(() => {
    const live = new Set<ItemId>(options.items.map((item) => item.id))
    for (const id of refCache.keys()) {
      if (!live.has(id)) {
        refCache.delete(id)
      }
    }
  }, [options.items, refCache])

  useEffect(
    () => () => {
      bindingRef.current?.destroy()
      store.destroy()
    },
    [store],
  )

  const containerRef = useCallback(
    (element: HTMLElement | null): void => {
      if (element === null) {
        bindingRef.current?.destroy()
        bindingRef.current = undefined
        return
      }
      const bindOptions: BindOptions = {
        scroll: element,
        axis,
        overscan,
        ...(animate !== undefined ? { animate } : {}),
        ...(environment !== undefined ? { environment } : {}),
      }
      const binding = bindEngine(engine, bindOptions)
      bindingRef.current = binding
      store.attach(binding)
    },
    [engine, store, axis, overscan, animate, environment],
  )

  const refFor = useCallback(
    (id: ItemId) => {
      const existing = refCache.get(id)
      if (existing !== undefined) {
        return existing
      }
      const ref = (element: HTMLElement | null): void => {
        if (element !== null) {
          bindingRef.current?.observeItem(id, element)
        } else {
          bindingRef.current?.unobserveItem(id)
        }
      }
      refCache.set(id, ref)
      return ref
    },
    [refCache],
  )

  const items = useMemo(
    () => buildItems(options.items, state.snapshot, state.visible, refFor),
    [options.items, state, refFor],
  )

  const contentProps = useMemo(
    () => ({
      ...contentAria(),
      style: contentStyle(state.snapshot.contentSize.width, state.snapshot.contentSize.height),
    }),
    [state.snapshot.contentSize.width, state.snapshot.contentSize.height],
  )

  return {
    containerProps: {
      ref: containerRef,
      style: containerStyle,
      tabIndex: CONTAINER_TAB_INDEX,
      ...containerAria(options.label),
    },
    contentProps,
    items,
    totalSize: state.snapshot.contentSize,
    engine,
  }
}
