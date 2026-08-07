import {
  binPacking,
  columns as columnsAlgorithm,
  horizontalMasonry,
  justified,
  type LayoutAlgorithm,
  magazine,
  masonry,
  packing,
  quilt,
  staggered,
} from '@laynjs/core'

export interface AlgoParams {
  readonly columns: number
  readonly size: number
}

export interface AlgoSpec {
  readonly id: string
  readonly label: string
  readonly axis: 'vertical' | 'horizontal'
  readonly usesCount: boolean
  readonly usesSize: boolean
  readonly sizeLabel?: string
  readonly codeName: string
  readonly make: (params: AlgoParams) => LayoutAlgorithm
  readonly code: (params: AlgoParams) => string
}

export const ALGORITHMS: AlgoSpec[] = [
  {
    id: 'masonry',
    label: 'Masonry',
    axis: 'vertical',
    usesCount: true,
    usesSize: false,
    codeName: 'masonry',
    make: ({ columns }) => masonry({ columns }),
    code: ({ columns }) => `masonry({ columns: ${columns} })`,
  },
  {
    id: 'columns',
    label: 'Columns',
    axis: 'vertical',
    usesCount: true,
    usesSize: false,
    codeName: 'columns',
    make: ({ columns }) => columnsAlgorithm({ columns }),
    code: ({ columns }) => `columns({ columns: ${columns} })`,
  },
  {
    id: 'justified',
    label: 'Justified',
    axis: 'vertical',
    usesCount: false,
    usesSize: true,
    sizeLabel: 'Row height',
    codeName: 'justified',
    make: ({ size }) => justified({ targetRowHeight: size }),
    code: ({ size }) => `justified({ targetRowHeight: ${size} })`,
  },
  {
    id: 'staggered',
    label: 'Staggered',
    axis: 'vertical',
    usesCount: true,
    usesSize: false,
    codeName: 'staggered',
    make: ({ columns }) => staggered({ columns }),
    code: ({ columns }) => `staggered({ columns: ${columns} })`,
  },
  {
    id: 'packing',
    label: 'Packing',
    axis: 'vertical',
    usesCount: false,
    usesSize: true,
    sizeLabel: 'Tile size',
    codeName: 'packing',
    make: ({ size }) => packing({ baseSize: size }),
    code: ({ size }) => `packing({ baseSize: ${size} })`,
  },
  {
    id: 'bin-packing',
    label: 'Bin packing',
    axis: 'vertical',
    usesCount: false,
    usesSize: true,
    sizeLabel: 'Tile size',
    codeName: 'binPacking',
    make: ({ size }) => binPacking({ baseSize: size }),
    code: ({ size }) => `binPacking({ baseSize: ${size} })`,
  },
  {
    id: 'quilt',
    label: 'Quilt',
    axis: 'vertical',
    usesCount: true,
    usesSize: false,
    codeName: 'quilt',
    make: ({ columns }) => quilt({ columns }),
    code: ({ columns }) => `quilt({ columns: ${columns} })`,
  },
  {
    id: 'magazine',
    label: 'Magazine',
    axis: 'vertical',
    usesCount: false,
    usesSize: true,
    sizeLabel: 'Row height',
    codeName: 'magazine',
    make: ({ size }) => magazine({ rowHeight: size }),
    code: ({ size }) => `magazine({ rowHeight: ${size} })`,
  },
  {
    id: 'horizontal',
    label: 'Horizontal masonry',
    axis: 'horizontal',
    usesCount: true,
    usesSize: false,
    codeName: 'horizontalMasonry',
    make: ({ columns }) => horizontalMasonry({ rows: columns }),
    code: ({ columns }) => `horizontalMasonry({ rows: ${columns} })`,
  },
]

export interface Preset {
  readonly id: string
  readonly label: string
  readonly hint: string
  readonly algoId: string
  readonly columns: number
  readonly size: number
  readonly gap: number
  readonly images: boolean
  readonly infinite?: boolean
}

export const PRESETS: Preset[] = [
  {
    id: 'gallery',
    label: 'Photo wall',
    hint: 'Classic 4-column masonry',
    algoId: 'masonry',
    columns: 4,
    size: 200,
    gap: 12,
    images: true,
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    hint: 'Dense, narrow columns',
    algoId: 'masonry',
    columns: 6,
    size: 200,
    gap: 8,
    images: true,
  },
  {
    id: 'justified',
    label: 'Justified rows',
    hint: 'Flickr-style full rows',
    algoId: 'justified',
    columns: 4,
    size: 200,
    gap: 8,
    images: true,
  },
  {
    id: 'magazine',
    label: 'Magazine',
    hint: 'Editorial hero rows',
    algoId: 'magazine',
    columns: 4,
    size: 240,
    gap: 14,
    images: true,
  },
  {
    id: 'mosaic',
    label: 'Tight mosaic',
    hint: 'Hole-filling bin packing',
    algoId: 'bin-packing',
    columns: 4,
    size: 150,
    gap: 6,
    images: true,
  },
  {
    id: 'quilt',
    label: 'Quilt',
    hint: 'Interlocking template grid',
    algoId: 'quilt',
    columns: 4,
    size: 200,
    gap: 10,
    images: true,
  },
  {
    id: 'filmstrip',
    label: 'Film strip',
    hint: 'Horizontal scroller',
    algoId: 'horizontal',
    columns: 2,
    size: 200,
    gap: 12,
    images: true,
  },
  {
    id: 'swatches',
    label: 'Color grid',
    hint: 'Ordered columns, no images',
    algoId: 'columns',
    columns: 5,
    size: 200,
    gap: 10,
    images: false,
  },
  {
    id: 'feed',
    label: 'Infinite feed',
    hint: 'Loads another page at the end',
    algoId: 'masonry',
    columns: 3,
    size: 200,
    gap: 12,
    images: false,
    infinite: true,
  },
]

const ratioSeed = (index: number): number => 0.7 + (((index * 2654435761) % 1000) / 1000) * 1.1

export const toneOf = (index: number): number =>
  Math.floor((((index * 2654435761) >>> 0) / 4294967296) * 5)

export interface TileData {
  readonly src: string
  readonly label: string
}

export interface Tile {
  readonly id: number
  readonly aspectRatio: number
  readonly data: TileData
}

const shuffled = (tiles: Tile[], seed: number): Tile[] => {
  let state = (seed * 2654435761) >>> 0
  for (let index = tiles.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0
    const other = state % (index + 1)
    const tile = tiles[index]
    const swap = tiles[other]
    if (tile !== undefined && swap !== undefined) {
      tiles[index] = swap
      tiles[other] = tile
    }
  }
  return tiles
}

const tileOf = (id: number, label: string): Tile => {
  const aspectRatio = ratioSeed(id)
  const width = 420
  const height = Math.round(width / aspectRatio)
  return {
    id,
    aspectRatio,
    data: { src: `https://picsum.photos/seed/layn${id}/${width}/${height}`, label },
  }
}

const PREPEND_ID_BASE = 100000

const makePrepended = (count: number): Tile[] =>
  Array.from({ length: count }, (_, index) => tileOf(PREPEND_ID_BASE + index, `+${index + 1}`))

export const makeTiles = (count: number, seed = 0, prepended = 0): Tile[] => {
  const tiles = [
    ...makePrepended(prepended),
    ...Array.from({ length: count }, (_, index) => tileOf(index, String(index))),
  ]
  return seed === 0 ? tiles : shuffled(tiles, seed)
}
