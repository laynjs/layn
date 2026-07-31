import type { DomEnvironment } from '../types/index.js'

const readTransform = (element: Element): { x: number; y: number } => {
  const value = getComputedStyle(element).transform
  if (value === '' || value === 'none') {
    return { x: 0, y: 0 }
  }
  const matrix = new DOMMatrixReadOnly(value)
  return { x: matrix.e, y: matrix.f }
}

const defaults: DomEnvironment = {
  requestAnimationFrame: (callback) => requestAnimationFrame(callback),
  cancelAnimationFrame: (handle) => cancelAnimationFrame(handle),
  createResizeObserver: (callback) => new ResizeObserver(callback),
  readTransform,
}

export const resolveEnvironment = (partial?: Partial<DomEnvironment>): DomEnvironment => ({
  requestAnimationFrame: partial?.requestAnimationFrame ?? defaults.requestAnimationFrame,
  cancelAnimationFrame: partial?.cancelAnimationFrame ?? defaults.cancelAnimationFrame,
  createResizeObserver: partial?.createResizeObserver ?? defaults.createResizeObserver,
  readTransform: partial?.readTransform ?? defaults.readTransform,
})
