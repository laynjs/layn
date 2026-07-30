import {
  binPacking,
  columns,
  horizontalMasonry,
  justified,
  type LayoutAlgorithm,
  type LayoutItem,
  magazine,
  masonry,
  packing,
  quilt,
  staggered,
} from '@laynjs/core'

export interface LayoutSpec {
  readonly id: string
  readonly label: string
  readonly algorithm: LayoutAlgorithm
  readonly axis: 'vertical' | 'horizontal'
}

export const aspectRatio = (value: number): number =>
  0.7 + (((value * 2654435761) % 1000) / 1000) * 1.4

export const hue = (value: number): number => (value * 47) % 360

export const items: LayoutItem<number>[] = Array.from({ length: 160 }, (_, index) => ({
  id: index,
  aspectRatio: aspectRatio(index),
  data: index,
}))

export const layouts: LayoutSpec[] = [
  {
    id: 'masonry',
    label: 'Masonry (shortest column)',
    algorithm: masonry({ columns: 4 }),
    axis: 'vertical',
  },
  {
    id: 'columns',
    label: 'Columns (round-robin)',
    algorithm: columns({ columns: 4 }),
    axis: 'vertical',
  },
  {
    id: 'justified',
    label: 'Justified (Flickr rows)',
    algorithm: justified({ targetRowHeight: 150 }),
    axis: 'vertical',
  },
  {
    id: 'staggered',
    label: 'Staggered (brick offset)',
    algorithm: staggered({ columns: 4 }),
    axis: 'vertical',
  },
  {
    id: 'packing',
    label: 'Packing (skyline)',
    algorithm: packing({ baseSize: 150 }),
    axis: 'vertical',
  },
  {
    id: 'bin-packing',
    label: 'Bin-packing (maxrects)',
    algorithm: binPacking({ baseSize: 150 }),
    axis: 'vertical',
  },
  { id: 'quilt', label: 'Quilt (span grid)', algorithm: quilt({ columns: 4 }), axis: 'vertical' },
  {
    id: 'magazine',
    label: 'Magazine (editorial rows)',
    algorithm: magazine({ rowHeight: 170 }),
    axis: 'vertical',
  },
  {
    id: 'horizontal-masonry',
    label: 'Horizontal masonry',
    algorithm: horizontalMasonry({ rows: 3 }),
    axis: 'horizontal',
  },
]
