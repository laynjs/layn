import type { TrackCount } from './responsive.js'

export interface HorizontalMasonryOptions {
  readonly rows?: TrackCount
  readonly rowHeight?: number
  readonly maxRows?: number
}
