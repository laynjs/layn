export interface DomEnvironment {
  requestAnimationFrame(callback: () => void): number
  cancelAnimationFrame(handle: number): void
  createResizeObserver(callback: ResizeObserverCallback): ResizeObserver
}
