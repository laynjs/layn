import type { TrackCount } from './responsive.js'

export interface MasonryOptions {
  readonly columns?: TrackCount
  readonly columnWidth?: number
  readonly maxColumns?: number
}
