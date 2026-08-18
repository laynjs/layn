import type { LayoutAlgorithm } from './algorithm.js'
import type { Direction, Gap, ItemId, Size, Viewport } from './common.js'
import type { LayoutItem } from './item.js'
import type { MeasuredEntry, MeasurementsOptions } from './measurement.js'
import type { Positions, SerializedPositions } from './positions.js'
import type { ScrollWindow, VisibleOptions } from './virtualization.js'

/** Everything `createEngine` needs. Only `algorithm` is required. */
export interface EngineConfig {
  /** The layout algorithm, for example `masonry({ columns: 4 })`. */
  readonly algorithm: LayoutAlgorithm
  /** Space between items. Defaults to no gap. */
  readonly gap?: Gap
  /**
   * The box to lay out into. On the client the DOM binding keeps this in sync with the container;
   * on the server pass the width you expect, or the layout has no room to work with.
   */
  readonly viewport?: Viewport
  readonly items?: readonly LayoutItem[]
  /** Fallback sizing: an estimator and a default size for items with no shape of their own. */
  readonly measurements?: MeasurementsOptions
  /** Pre-seeded DOM measurements, as produced by `serialize()`. */
  readonly measured?: ReadonlyArray<readonly [ItemId, Size]>
  /** Set to `'rtl'` to mirror the layout. Create-time only; there is no setter. */
  readonly direction?: Direction
}

/**
 * An immutable view of the layout. The reference is stable until something actually changes, which
 * is what makes it safe to hand to `useSyncExternalStore` and friends.
 */
export interface EngineSnapshot {
  /** Increments on every committed change. */
  readonly version: number
  readonly positions: Positions
  /** The full size of the laid-out content, which is what you size the scroll wrapper to. */
  readonly contentSize: Size
  readonly viewport: Viewport
  readonly items: readonly LayoutItem[]
}

/**
 * The stateful engine. Created by `createEngine`, and normally driven for you by an adapter such as
 * `@laynjs/react` rather than by hand.
 */
export interface LayoutEngine {
  /** The current snapshot. Stable by reference until a change is committed. */
  getSnapshot(): EngineSnapshot
  /** Subscribe to commits. Returns the unsubscribe function. */
  subscribe(listener: () => void): () => void
  /**
   * Replace the items. The engine diffs against the previous array and takes the cheapest path:
   * no layout at all when nothing moved, an incremental append when items were only added at the
   * end, otherwise a full relayout.
   */
  setItems(items: readonly LayoutItem[]): void
  /** Append items incrementally. Costs O(added) rather than O(total): the infinite-scroll path. */
  appendItems(items: readonly LayoutItem[]): void
  setViewport(viewport: Viewport): void
  setGap(gap: Gap): void
  setAlgorithm(algorithm: LayoutAlgorithm): void
  /** Feed real DOM sizes back in. Recomputes only when a size actually changed. */
  measure(entries: readonly MeasuredEntry[]): void
  /** Whether this item's size came from a DOM measurement rather than from your data. */
  isMeasured(id: ItemId): boolean
  /**
   * The items intersecting a scroll window, as **indices** into the item array, not ids. Indices
   * let a renderer read `items[i]` and `positions.rectAt(i)` in O(1).
   */
  getVisible(window: ScrollWindow, options?: VisibleOptions): readonly number[]
  /** Snapshot the layout for embedding in server-rendered HTML. See `hydrateEngine`. */
  serialize(): SerializedLayout
  destroy(): void
}

/** A layout serialized on the server and rehydrated on the client. */
export interface SerializedLayout {
  readonly version: number
  readonly algorithm: string
  readonly gap: Gap
  readonly viewport: Viewport
  readonly items: readonly LayoutItem[]
  readonly direction?: Direction
  readonly measured: ReadonlyArray<readonly [ItemId, Size]>
  readonly positions: SerializedPositions
  readonly contentSize: Size
}

export interface HydrateOptions {
  /** Must be configured identically to the algorithm used on the server. */
  readonly algorithm: LayoutAlgorithm
  readonly measurements?: MeasurementsOptions
  /**
   * Recompute the layout and compare it against the serialized rectangles, throwing on a mismatch.
   * Catches option drift between server and client. Worth enabling in development.
   */
  readonly verify?: boolean
}
