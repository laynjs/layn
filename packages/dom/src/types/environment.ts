import type { TransformOffset } from './transitions.js'

export interface DomEnvironment {
  requestAnimationFrame(callback: () => void): number
  cancelAnimationFrame(handle: number): void
  createResizeObserver(callback: ResizeObserverCallback): ResizeObserver
  readTransform(element: Element): TransformOffset
}
