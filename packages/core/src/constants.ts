import type { Gap, MagazineRow, QuiltSpan, Viewport } from './types/index.js'

export const FALLBACK_ASPECT_RATIO = 1

export const MEASURED_WIDTH_EPSILON = 0.5

export const MIN_COLUMN_COUNT = 1

export const MIN_SPAN = 1

export const DEFAULT_COLUMN_COUNT = 1

export const SERIALIZATION_VERSION = 1

export const DEFAULT_GAP: Gap = { x: 0, y: 0 }

export const DEFAULT_VIEWPORT: Viewport = { width: 0, height: 0 }

export const DEFAULT_BAND_SIZE = 256

export const DEFAULT_OVERSCAN = 0

export const DEFAULT_ROW_HEIGHT = 240

export const DEFAULT_STAGGER = 0.5

export const DEFAULT_PACK_SIZE = 180

export const MAXRECTS_FREE_CAP = 64

export const DEFAULT_QUILT_PATTERN: readonly QuiltSpan[] = [
  [2, 2],
  [1, 1],
  [1, 1],
  [1, 2],
  [1, 1],
  [2, 1],
  [1, 1],
  [1, 1],
]

export const DEFAULT_MAGAZINE_UNIT = 260

export const DEFAULT_MAGAZINE_TEMPLATES: readonly MagazineRow[] = [
  { weights: [2, 1], height: 1 },
  { weights: [1, 1, 1], height: 0.72 },
  { weights: [1], height: 1.15 },
  { weights: [1, 2], height: 0.95 },
  { weights: [1, 1], height: 0.8 },
]
