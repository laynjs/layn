import type { DomEnvironment } from '../types/index.js'

const defaults: DomEnvironment = {
  requestAnimationFrame: (callback) => requestAnimationFrame(callback),
  cancelAnimationFrame: (handle) => cancelAnimationFrame(handle),
  createResizeObserver: (callback) => new ResizeObserver(callback),
}

export const resolveEnvironment = (partial?: Partial<DomEnvironment>): DomEnvironment => ({
  requestAnimationFrame: partial?.requestAnimationFrame ?? defaults.requestAnimationFrame,
  cancelAnimationFrame: partial?.cancelAnimationFrame ?? defaults.cancelAnimationFrame,
  createResizeObserver: partial?.createResizeObserver ?? defaults.createResizeObserver,
})
