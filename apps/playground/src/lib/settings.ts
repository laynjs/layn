export interface Settings {
  readonly algoId: string
  readonly columns: number
  readonly gap: number
  readonly count: number
  readonly size: number
  readonly overscan: number
  readonly showImages: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  algoId: 'masonry',
  columns: 4,
  gap: 12,
  count: 400,
  size: 200,
  overscan: 400,
  showImages: false,
}
