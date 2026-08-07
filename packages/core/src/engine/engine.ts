import {
  DEFAULT_BAND_SIZE,
  DEFAULT_GAP,
  DEFAULT_OVERSCAN,
  DEFAULT_VIEWPORT,
  SERIALIZATION_VERSION,
} from '../constants.js'
import { diffItems } from '../diff/index.js'
import { createMeasurements } from '../measurement/index.js'
import { samePositions } from '../positions/index.js'
import type {
  EngineConfig,
  EngineSnapshot,
  Gap,
  ItemId,
  LayoutContext,
  LayoutEngine,
  LayoutResult,
  ScrollWindow,
  SerializedLayout,
  Viewport,
  VisibleOptions,
} from '../types/index.js'
import { createSpatialIndex } from '../virtualization/index.js'
import { createMeasuredCache } from './measured-cache.js'
import type { IndexCache } from './types.js'

export const createEngine = (config: EngineConfig): LayoutEngine => {
  let algorithm = config.algorithm
  const measured = createMeasuredCache(config.measured)
  const measurements = createMeasurements({
    ...config.measurements,
    cache: { get: measured.get },
  })

  let items = config.items ?? []
  let viewport = config.viewport ?? DEFAULT_VIEWPORT
  let gap = config.gap ?? DEFAULT_GAP
  let version = 0

  const listeners = new Set<() => void>()
  const contextOf = (): LayoutContext => ({ viewport, gap, measurements })

  let lastResult = algorithm.layout(items, contextOf())

  const toSnapshot = (): EngineSnapshot => ({
    version,
    positions: lastResult.positions,
    contentSize: lastResult.contentSize,
    viewport,
    items,
  })

  let snapshot = toSnapshot()
  let indexCache: IndexCache | undefined

  const commit = (): void => {
    version += 1
    snapshot = toSnapshot()
    for (const listener of listeners) {
      listener()
    }
  }

  const relayout = (previous?: LayoutResult): void => {
    const next = algorithm.layout(items, contextOf(), previous)
    lastResult = next
    const unchanged =
      items === snapshot.items &&
      viewport === snapshot.viewport &&
      next.contentSize.width === snapshot.contentSize.width &&
      next.contentSize.height === snapshot.contentSize.height &&
      samePositions(snapshot.positions, next.positions)
    if (!unchanged) {
      commit()
    }
  }

  const measure: LayoutEngine['measure'] = (entries) => {
    if (measured.record(entries)) {
      relayout()
    }
  }

  const getVisible = (window: ScrollWindow, options: VisibleOptions = {}): readonly number[] => {
    const axis = options.axis ?? 'vertical'
    const bandSize = options.bandSize ?? DEFAULT_BAND_SIZE
    if (
      indexCache === undefined ||
      indexCache.positions !== snapshot.positions ||
      indexCache.axis !== axis ||
      indexCache.bandSize !== bandSize
    ) {
      indexCache = {
        positions: snapshot.positions,
        axis,
        bandSize,
        index: createSpatialIndex(snapshot.positions, { axis, bandSize }),
      }
    }
    return indexCache.index.query(window, options.overscan ?? DEFAULT_OVERSCAN)
  }

  const serialize = (): SerializedLayout => {
    const positions = snapshot.positions
    const ids = new Array<ItemId>(positions.count)
    for (let i = 0; i < positions.count; i += 1) {
      ids[i] = positions.idAt(i)
    }
    return {
      version: SERIALIZATION_VERSION,
      algorithm: algorithm.name,
      gap,
      viewport,
      items,
      measured: measured.entries(),
      positions: {
        ids,
        x: Array.from(positions.x),
        y: Array.from(positions.y),
        width: Array.from(positions.width),
        height: Array.from(positions.height),
      },
      contentSize: snapshot.contentSize,
    }
  }

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setItems: (next) => {
      if (next === items) {
        return
      }
      const diff = diffItems(items, next)
      const previous = lastResult
      items = next
      if (diff.kind === 'identical') {
        commit()
        return
      }
      if (diff.kind === 'append') {
        relayout(previous)
        return
      }
      if (diff.removedCount > 0) {
        measured.prune(items)
      }
      relayout()
    },
    appendItems: (next) => {
      const previous = lastResult
      items = [...items, ...next]
      relayout(previous)
    },
    setViewport: (next: Viewport) => {
      if (next.width === viewport.width && next.height === viewport.height) {
        return
      }
      viewport = next
      relayout()
    },
    setGap: (next: Gap) => {
      if (next.x === gap.x && next.y === gap.y) {
        return
      }
      gap = next
      relayout()
    },
    setAlgorithm: (next) => {
      algorithm = next
      relayout()
    },
    measure,
    getVisible,
    serialize,
    destroy: () => {
      listeners.clear()
    },
  }
}
