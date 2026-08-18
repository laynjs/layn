export interface Settings {
  readonly algoId: string
  readonly columns: number
  readonly gap: number
  readonly count: number
  readonly size: number
  readonly overscan: number
  readonly responsive: boolean
  readonly rtl: boolean
  readonly sections: boolean
  readonly heroEvery: number
  readonly radius: number
  readonly showImages: boolean
  readonly animate: boolean
  readonly shuffleSeed: number
  readonly prepended: number
  readonly removed: number
  readonly reorder: boolean
  readonly infinite: boolean
  readonly devtools: boolean
  readonly loaded: number
}

export const DEFAULT_SETTINGS: Settings = {
  algoId: 'masonry',
  columns: 4,
  gap: 12,
  count: 400,
  size: 200,
  overscan: 400,
  responsive: false,
  rtl: false,
  sections: false,
  heroEvery: 0,
  radius: 10,
  showImages: false,
  animate: true,
  shuffleSeed: 0,
  prepended: 0,
  removed: 0,
  reorder: false,
  infinite: false,
  devtools: false,
  loaded: 0,
}
