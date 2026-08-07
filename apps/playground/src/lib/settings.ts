export interface Settings {
  readonly algoId: string
  readonly columns: number
  readonly gap: number
  readonly count: number
  readonly size: number
  readonly overscan: number
  readonly showImages: boolean
  readonly animate: boolean
  readonly shuffleSeed: number
  readonly prepended: number
  readonly removed: number
  readonly infinite: boolean
  readonly loaded: number
}

export const INFINITE_PAGE_SIZE = 50

export const REMOVE_BATCH_SIZE = 10

export const DEFAULT_SETTINGS: Settings = {
  algoId: 'masonry',
  columns: 4,
  gap: 12,
  count: 400,
  size: 200,
  overscan: 400,
  showImages: false,
  animate: true,
  shuffleSeed: 0,
  prepended: 0,
  removed: 0,
  infinite: false,
  loaded: 0,
}
