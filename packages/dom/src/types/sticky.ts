import type { LayoutEngine, LayoutItem } from '@laynjs/core'

export interface StickySection {
  readonly index: number
  readonly top: number
  readonly size: number
  readonly bottom: number
}

export interface StickySetup {
  readonly engine: LayoutEngine
  readonly isHeader: (item: LayoutItem) => boolean
  readonly elementOf: (index: number) => HTMLElement | undefined
}

/** Pins the header of whichever section is currently under the top of the viewport. */
export interface StickyHeaders {
  refresh(): void
  update(start: number): void
  pinnedIndex(): number | undefined
  release(): void
}
