import type { PositionData } from '../positions/types.js'

export interface ColumnCountOptions {
  readonly columns?: number
  readonly columnWidth?: number
  readonly maxColumns?: number
}

export interface RowCountOptions {
  readonly rows?: number
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
