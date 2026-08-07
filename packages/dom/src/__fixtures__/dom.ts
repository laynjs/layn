import type { DomEnvironment, TransformOffset } from '../types/index.js'

export class FakeAnimation {
  onfinish: (() => void) | null = null
  canceled = false

  constructor(
    readonly keyframes: Keyframe[],
    readonly options: KeyframeAnimationOptions,
  ) {}

  cancel(): void {
    this.canceled = true
  }

  finish(): void {
    this.onfinish?.()
  }
}

export class FakeElement {
  scrollTop = 0
  scrollLeft = 0
  clientWidth = 0
  clientHeight = 0
  rect = { top: 0, left: 0, width: 0, height: 0 }
  transform: TransformOffset = { x: 0, y: 0 }
  readonly animations: FakeAnimation[] = []
  readonly attributes = new Map<string, string>()
  readonly style: Record<string, string> = {}
  readonly children: FakeElement[] = []
  parentElement: FakeElement | null = null
  private readonly handlers = new Map<string, Set<() => void>>()

  animate(keyframes: Keyframe[], options: KeyframeAnimationOptions): FakeAnimation {
    const animation = new FakeAnimation(keyframes, options)
    this.animations.push(animation)
    return animation
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value)
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name)
  }

  appendChild(child: FakeElement): void {
    child.parentElement = this
    this.children.push(child)
  }

  remove(): void {
    const parent = this.parentElement
    if (parent !== null) {
      parent.children.splice(parent.children.indexOf(this), 1)
    }
    this.parentElement = null
  }

  cloneNode(): FakeElement {
    const clone = new FakeElement()
    for (const [name, value] of this.attributes) {
      clone.attributes.set(name, value)
    }
    Object.assign(clone.style, this.style)
    return clone
  }

  scrollTo(options: ScrollToOptions): void {
    this.lastScrollTo = options
    this.scrollTop = options.top ?? this.scrollTop
    this.scrollLeft = options.left ?? this.scrollLeft
  }

  lastScrollTo: ScrollToOptions | undefined

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

  emit(type: string, event?: unknown): void {
    for (const handler of this.handlers.get(type) ?? []) {
      ;(handler as (value?: unknown) => void)(event)
    }
  }

  captured = false

  setPointerCapture(): void {
    this.captured = true
  }

  releasePointerCapture(): void {
    this.captured = false
  }

  get ownerDocument(): FakeElement {
    return fakeDocument
  }
}

export const fakeDocument = new FakeElement()

export class FakeWindow {
  scrollX = 0
  scrollY = 0
  innerWidth = 0
  innerHeight = 0
  lastScrollTo: ScrollToOptions | undefined
  private readonly handlers = new Map<string, Set<() => void>>()

  scrollTo(options: ScrollToOptions): void {
    this.lastScrollTo = options
    this.scrollY = options.top ?? this.scrollY
    this.scrollX = options.left ?? this.scrollX
  }

  addEventListener(type: string, handler: () => void): void {
    const set = this.handlers.get(type) ?? new Set<() => void>()
    set.add(handler)
    this.handlers.set(type, set)
  }

  removeEventListener(type: string, handler: () => void): void {
    this.handlers.get(type)?.delete(handler)
  }

  emit(type: string, event?: unknown): void {
    for (const handler of this.handlers.get(type) ?? []) {
      ;(handler as (value?: unknown) => void)(event)
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
    readTransform: (element) => (element as unknown as FakeElement).transform,
  }

  const flushRaf = (): void => {
    while (queue.length > 0) {
      const pending = queue.splice(0)
      for (const callback of pending) {
        callback()
      }
    }
  }

  return { environment, observers, flushRaf }
}

export const asElement = (element: FakeElement): HTMLElement => element as unknown as HTMLElement

export const asWindow = (window: FakeWindow): Window => window as unknown as Window
