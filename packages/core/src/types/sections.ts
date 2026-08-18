import type { LayoutItem } from './item.js'

/**
 * Options for `sections`, the higher-order algorithm that runs an inner algorithm once per group so
 * each group's columns start level.
 *
 * A header is an ordinary item your predicate recognises, not a synthesised one, which is what lets
 * headers virtualize, animate and serialize like anything else. Give header items a fixed `height`
 * and no `aspectRatio`, or they will be sized as if they were content.
 */
export interface SectionsOptions {
  /** Returns true for the item that begins a section. */
  readonly isHeader: (item: LayoutItem) => boolean
  /** Extra space before each section beyond the normal gap. */
  readonly sectionGap?: number
}
