import type { LayoutContext } from '../types/index.js'

/**
 * The extent a custom algorithm should mirror against, or `undefined` in left-to-right. Hand the
 * result straight to `createPositionsBuilder` and right-to-left works for free.
 */
export const mirrorExtent = (context: LayoutContext): number | undefined =>
  context.direction === 'rtl' ? context.viewport.width : undefined
