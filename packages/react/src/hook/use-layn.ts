import {
  CONTAINER_TAB_INDEX,
  containerAria,
  contentAria,
  createStore,
  resolveEngineConfig,
} from '@laynjs/adapter-utils'
import { createEngine, diffItems, type ItemId, type LayoutEngine } from '@laynjs/core'
import type { EngineBinding } from '@laynjs/dom'
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
import { useBindOptions } from './use-bind-options.js'
import { useConstant } from './use-constant.js'
import { useContainerRef } from './use-container-ref.js'

const containerStyle: CSSProperties = { position: 'relative', overflow: 'auto' }

const windowContainerStyle: CSSProperties = { position: 'relative' }

const contentStyle = (width: number, height: number): CSSProperties => ({
  position: 'relative',
  width,
  height,
})

/**
 * Lays out `items` and returns only the ones on screen, already positioned.
 *
 * The engine is created eagerly, so a server render is fully positioned and hydration cannot
 * mismatch. The scroll binding attaches when `containerProps.ref` runs.
 *
 * ```tsx
 * const layn = useLayn({ items, algorithm: masonry({ columns: 4 }), gap: { x: 12, y: 12 } });
 *
 * return (
 *   <div {...layn.containerProps} style={{ height: 600 }}>
 *     <div {...layn.contentProps}>
 *       {layn.items.map((entry) => (
 *         <div key={entry.id} ref={entry.ref} style={entry.style} {...entry.a11y} />
 *       ))}
 *     </div>
 *   </div>
 * );
 * ```
 */
export const useLayn = <TData = unknown>(options: UseLaynOptions<TData>): UseLaynResult<TData> => {
  const axis = options.axis ?? 'vertical'
  const overscan = options.overscan ?? 0
  const environment = options.environment
  const scroll = options.scroll
  const { animate, onReachEnd, reachEndThreshold, drag, stickyHeaders } = useBindOptions(options)

  const engine = useConstant<LayoutEngine>(() =>
    createEngine(
      resolveEngineConfig({
        algorithm: options.algorithm,
        items: options.items,
        gap: options.gap,
        viewport: options.viewport,
        measurements: options.measurements,
        direction: options.direction,
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

  const containerRef = useContainerRef(engine, store, bindingRef, {
    axis,
    overscan,
    scroll,
    environment,
    animate,
    onReachEnd,
    reachEndThreshold,
    drag,
    stickyHeaders,
  })

  const scrollToIndex = useCallback<UseLaynResult<TData>['scrollToIndex']>(
    (index, scrollOptions) => bindingRef.current?.scrollToIndex(index, scrollOptions),
    [],
  )
  const scrollToItem = useCallback<UseLaynResult<TData>['scrollToItem']>(
    (id, scrollOptions) => bindingRef.current?.scrollToItem(id, scrollOptions),
    [],
  )

  const startDrag = useCallback<UseLaynResult<TData>['startDrag']>(
    (id, event) => bindingRef.current?.startDrag(id, event),
    [],
  )

  const refFor = useCallback(
    (id: ItemId) => {
      const existing = refCache.get(id)
      if (existing !== undefined) {
        return existing
      }
      const ref = (element: HTMLElement | null): void => {
        if (element !== null) {
          store.observeItem(id, element)
        } else {
          store.unobserveItem(id)
        }
      }
      refCache.set(id, ref)
      return ref
    },
    [refCache, store],
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
      style: scroll === 'window' ? windowContainerStyle : containerStyle,
      tabIndex: CONTAINER_TAB_INDEX,
      ...containerAria(options.label),
    },
    contentProps,
    items,
    totalSize: state.snapshot.contentSize,
    engine,
    scrollToIndex,
    scrollToItem,
    startDrag,
  }
}
