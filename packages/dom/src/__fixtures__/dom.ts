import type { DomEnvironment } from '../types/index.js'

export class FakeElement {
  scrollTop = 0
  scrollLeft = 0
  clientWidth = 0
  clientHeight = 0
  rect = { top: 0, left: 0, width: 0, height: 0 }
  private readonly handlers = new Map<string, Set<() => void>>()

  addEventListener(type: string, handler: () => void): void {
    const set = this.handlers.get(type) ?? new Set<() => void>()
    set.add(handler)
    this.handlers.set(type, set)
  }

  removeEventListener(type: string, handler: () => void): void {
    this.handlers.get(type)?.delete(handler)
  }

  getBoundingClientRect(): { top: number; left: number; width: number; height: number } {
    return this.rect
  }

  emit(type: string): void {
    for (const handler of this.handlers.get(type) ?? []) {
      handler()
    }
  }
}

export class FakeWindow {
  scrollX = 0
  scrollY = 0
  innerWidth = 0
  innerHeight = 0
  private readonly handlers = new Map<string, Set<() => void>>()

  addEventListener(type: string, handler: () => void): void {
    const set = this.handlers.get(type) ?? new Set<() => void>()
    set.add(handler)
    this.handlers.set(type, set)
  }

  removeEventListener(type: string, handler: () => void): void {
    this.handlers.get(type)?.delete(handler)
  }

  emit(type: string): void {
    for (const handler of this.handlers.get(type) ?? []) {
      handler()
    }
  }
}

export class FakeResizeObserver {
  readonly observed = new Set<Element>()

  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(element: Element): void {
    this.observed.add(element)
  }

  unobserve(element: Element): void {
    this.observed.delete(element)
  }

  disconnect(): void {
    this.observed.clear()
  }

  trigger(
    entries: ReadonlyArray<{
      readonly target: Element
      readonly contentRect: { readonly width: number; readonly height: number }
    }>,
  ): void {
    this.callback(entries as unknown as ResizeObserverEntry[], this as unknown as ResizeObserver)
  }
}

export const createControlledEnvironment = (): {
  environment: DomEnvironment
  observers: FakeResizeObserver[]
  flushRaf: () => void
} => {
  const queue: Array<() => void> = []
  const observers: FakeResizeObserver[] = []

  const environment: DomEnvironment = {
    requestAnimationFrame: (callback) => queue.push(callback),
    cancelAnimationFrame: (handle) => {
      queue[handle - 1] = () => undefined
    },
    createResizeObserver: (callback) => {
      const observer = new FakeResizeObserver(callback)
      observers.push(observer)
      return observer as unknown as ResizeObserver
    },
  }

  const flushRaf = (): void => {
    const pending = queue.splice(0)
    for (const callback of pending) {
      callback()
    }
  }

  return { environment, observers, flushRaf }
}

export const asElement = (element: FakeElement): HTMLElement => element as unknown as HTMLElement

export const asWindow = (window: FakeWindow): Window => window as unknown as Window
