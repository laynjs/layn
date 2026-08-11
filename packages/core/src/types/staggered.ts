import type { TrackCount } from './responsive.js'

export interface StaggeredOptions {
  readonly columns?: TrackCount
  readonly columnWidth?: number
  readonly maxColumns?: number
  readonly stagger?: number
}
