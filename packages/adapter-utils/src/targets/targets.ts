import type { BindTargets, ScrollMode } from '../types/index.js'

export const resolveBindTargets = (
  mode: ScrollMode | undefined,
  element: HTMLElement,
): BindTargets => {
  if (mode === 'window') {
    const view = element.ownerDocument.defaultView
    if (view !== null) {
      return { scroll: view, origin: element }
    }
  }
  return { scroll: element }
}
