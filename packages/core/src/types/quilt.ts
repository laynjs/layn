import type { TrackCount } from './responsive.js'

export type QuiltSpan = readonly [number, number]

export interface QuiltOptions {
  readonly columns?: TrackCount
  readonly columnWidth?: number
  readonly maxColumns?: number
  readonly pattern?: readonly QuiltSpan[]
}
