import type { LayoutItem } from './item.js'

export interface SectionsOptions {
  readonly isHeader: (item: LayoutItem) => boolean
  readonly sectionGap?: number
}
