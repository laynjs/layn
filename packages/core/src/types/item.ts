import type { ItemId } from './common.js'

/** The size information layn needs about an item before any DOM exists. */
export interface LayoutItemShape {
  /** Stable identity. Reordering, appending and animating all key off this. */
  readonly id: ItemId
  /** Intrinsic width in pixels. Most algorithms derive width from the track instead. */
  readonly width?: number
  /** Intrinsic height in pixels. Use this or `aspectRatio` so the server can lay the item out. */
  readonly height?: number
  /**
   * Width divided by height. The preferred way to size an item: it survives any column width, which
   * is what lets the server and the client compute identical rectangles.
   */
  readonly aspectRatio?: number
  /**
   * Number of tracks this item covers, for hero tiles. Only `quilt` implements it, where the item
   * becomes an n by n block. Ignored elsewhere, deliberately: a spanning item cannot be placed
   * without gaps in a masonry layout.
   */
  readonly span?: number
}

/**
 * One item to lay out. Pass a type argument to attach your own record, which then arrives back on
 * `entry.item.data` when you render:
 *
 * ```ts
 * const items: LayoutItem<Photo>[] = photos.map((photo) => ({
 *   id: photo.id,
 *   aspectRatio: photo.width / photo.height,
 *   data: photo,
 * }));
 * ```
 *
 * With a type argument, `data` is required. Without one it stays optional.
 */
export type LayoutItem<TData = unknown> = LayoutItemShape &
  (unknown extends TData ? { readonly data?: unknown } : { readonly data: TData })
