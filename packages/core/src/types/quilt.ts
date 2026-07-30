export type QuiltSpan = readonly [number, number]

export interface QuiltOptions {
  readonly columns?: number
  readonly columnWidth?: number
  readonly maxColumns?: number
  readonly pattern?: readonly QuiltSpan[]
}
