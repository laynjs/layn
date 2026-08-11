import type { LayoutContext } from '../types/index.js'

export const mirrorExtent = (context: LayoutContext): number | undefined =>
  context.direction === 'rtl' ? context.viewport.width : undefined
