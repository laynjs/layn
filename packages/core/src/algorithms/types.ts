import type { PositionData } from '../positions/types.js'
import type { TrackCount } from '../types/index.js'

export interface ColumnCountOptions {
  readonly columns?: TrackCount
  readonly columnWidth?: number
  readonly maxColumns?: number
}

export interface RowCountOptions {
  readonly rows?: TrackCount
  readonly rowHeight?: number
  readonly maxRows?: number
}

export interface SkylineNode {
  x: number
  y: number
  width: number
}

export interface FreeRect {
  x: number
  y: number
  width: number
  height: number
}

export interface PackPlacement {
  readonly x: number
  readonly y: number
}

export interface Packer {
  place(width: number, height: number): PackPlacement | undefined
}

export interface MasonryState {
  readonly columnCount: number
  readonly columnWidth: number
  readonly columnHeights: readonly number[]
  readonly itemCount: number
  readonly data: PositionData
}

export interface SectionRun {
  readonly header: number
  readonly start: number
  readonly end: number
}
