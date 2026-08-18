/** One editorial row template: the relative widths of its items, and its height factor. */
export interface MagazineRow {
  /** Relative widths, summed and normalised to fill the container. */
  readonly weights: readonly number[]
  /** Row height as a multiple of `rowHeight`. */
  readonly height: number
}

/**
 * Options for `magazine`: rows cycling through editorial templates, such as a hero followed by a
 * triptych. Deterministic and layout-driven rather than content-driven.
 */
export interface MagazineOptions {
  /** Base row height in pixels, scaled by each template's height factor. */
  readonly rowHeight?: number
  /** The templates to cycle through. Defaults to a hero, triptych, duo and feature set. */
  readonly templates?: readonly MagazineRow[]
}
