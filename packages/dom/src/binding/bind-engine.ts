import type { LayoutEngine, Size } from '@laynjs/core'
import { createDragController } from '../dnd/index.js'
import { resolveEnvironment } from '../environment/index.js'
import { createSizeObserver } from '../measure/index.js'
import { createReachEndWatcher, rafThrottle, scrollOffsetFor } from '../scroll/index.js'
import { isElement, readOrigin, readScrollWindow, readViewportSize } from '../target/index.js'
import { createTransitionRunner, resolveTransitionConfig } from '../transitions/index.js'
import type {
  BindOptions,
  EngineBinding,
  ScrollTarget,
  ScrollToItemOptions,
} from '../types/index.js'

const sameIndices = (a: readonly number[], b: readonly number[]): boolean => {
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}

const sizeChanged = (previous: Size | undefined, next: Size): boolean =>
  previous === undefined || previous.width !== next.width || previous.height !== next.height

export const bindEngine = (engine: LayoutEngine, options: BindOptions): EngineBinding => {
  const environment = resolveEnvironment(options.environment)
  const axis = options.axis ?? 'vertical'
  const overscan = options.overscan ?? 0
  const scrollTarget = options.scroll
  const viewportTarget: ScrollTarget = options.viewport ?? scrollTarget
  const originTarget = options.origin

  const listeners = new Set<() => void>()
  let visible: readonly number[] = []
  let lastViewport: Size | undefined
  let originOffset = 0
  let lastPositions = engine.getSnapshot().positions

  const readVisible = (): readonly number[] => {
    const window = readScrollWindow(scrollTarget, axis, originOffset)
    const content = engine.getSnapshot().contentSize
    const extent = axis === 'vertical' ? content.height : content.width
    const start = Math.min(window.start, Math.max(0, extent - window.size))
    reachEnd?.check(start, window.size, extent)
    return engine.getVisible({ start, size: window.size }, { axis, overscan })
  }

  const notify = (): void => {
    for (const listener of listeners) {
      listener()
    }
  }

  const onLayoutChange = (): void => {
    const previous = lastPositions
    const next = engine.getSnapshot().positions
    lastPositions = next
    visible = readVisible()
    const dragged = drag?.activeId()
    runner?.play({
      previous,
      next,
      elementOf: sizeObserver.elementOf,
      leaving: sizeObserver.tracked(),
      visible,
      ...(dragged !== undefined ? { skip: dragged } : {}),
    })
    sizeObserver.forget()
    drag?.sync()
    notify()
  }

  const onScroll = (): void => {
    sizeObserver.forget()
    const next = readVisible()
    if (!sameIndices(visible, next)) {
      visible = next
      notify()
    }
  }

  const applyViewport = (): void => {
    originOffset = readOrigin(originTarget, scrollTarget, axis)
    const size = readViewportSize(viewportTarget)
    if (size.width <= 0 || size.height <= 0) {
      return
    }
    if (sizeChanged(lastViewport, size)) {
      lastViewport = size
      engine.setViewport(size)
    }
  }

  const onViewportResize = (): void => {
    applyViewport()
    onScroll()
  }

  const sizeObserver = createSizeObserver(environment, (entries) => engine.measure(entries))
  const runner = createTransitionRunner(environment, options.animate)
  const reachEnd = createReachEndWatcher(environment, options.onReachEnd, options.reachEndThreshold)
  const drag = createDragController({
    engine,
    environment,
    elementOf: sizeObserver.elementOf,
    visibleOf: () => visible,
    settle: resolveTransitionConfig(options.animate),
    options: options.drag ?? {},
  })
  const viewportObserver = isElement(viewportTarget)
    ? environment.createResizeObserver(applyViewport)
    : undefined
  viewportObserver?.observe(viewportTarget as Element)
  if (!isElement(viewportTarget)) {
    viewportTarget.addEventListener('resize', onViewportResize)
  }

  const scrollToIndex = (index: number, options?: ScrollToItemOptions): void => {
    const positions = engine.getSnapshot().positions
    if (index < 0 || index >= positions.count) {
      return
    }
    const rect = positions.rectAt(index)
    const size = readScrollWindow(scrollTarget, axis, originOffset).size
    const offset = scrollOffsetFor(rect, axis, size, options?.align ?? 'start') + originOffset
    const position = Math.max(0, offset)
    scrollTarget.scrollTo({
      ...(axis === 'vertical' ? { top: position } : { left: position }),
      ...(options?.behavior !== undefined ? { behavior: options.behavior } : {}),
    })
  }

  const scroll = rafThrottle(environment, onScroll)
  scrollTarget.addEventListener('scroll', scroll.run, { passive: true })

  applyViewport()
  lastPositions = engine.getSnapshot().positions
  const unsubscribeEngine = engine.subscribe(onLayoutChange)
  visible = readVisible()

  return {
    observeItem: (id, element) => sizeObserver.observe(id, element),
    unobserveItem: (id) => sizeObserver.unobserve(id),
    getVisible: () => visible,
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    scrollToIndex,
    startDrag: (id, event) => drag?.start(id, event),
    scrollToItem: (id, options) => {
      const index = engine.getSnapshot().positions.indexOf(id)
      if (index >= 0) {
        scrollToIndex(index, options)
      }
    },
    refresh: () => {
      applyViewport()
      visible = readVisible()
      notify()
    },
    destroy: () => {
      drag?.stop()
      runner?.stop()
      reachEnd?.stop()
      scrollTarget.removeEventListener('scroll', scroll.run)
      scroll.cancel()
      viewportObserver?.disconnect()
      if (!isElement(viewportTarget)) {
        viewportTarget.removeEventListener('resize', onViewportResize)
      }
      sizeObserver.disconnect()
      unsubscribeEngine()
      listeners.clear()
    },
  }
}
