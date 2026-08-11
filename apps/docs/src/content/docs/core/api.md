---
title: API reference
description: Every exported function, option, and type in @laynjs/core.
---

The complete public surface of `@laynjs/core`. Adapters re-expose most of this through their own hooks;
this page is the ground truth.

## createEngine

```ts
function createEngine<TData>(config: EngineConfig<TData>): LayoutEngine<TData>;
```

Creates a stateful engine. See [the engine](/core/engine/).

### EngineConfig

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `algorithm` | `LayoutAlgorithm` | yes | The layout algorithm. |
| `items` | `LayoutItem<TData>[]` | yes | The items to lay out. |
| `gap` | `Gap` | no | `{ x, y }` spacing. Defaults to `{ x: 0, y: 0 }`. |
| `viewport` | `Viewport` | no | `{ width, height }` of the container. |
| `measurements` | `MeasurementsOptions` | no | Estimator and fallback ratio. |
| `direction` | `Direction` | no | `'rtl'` mirrors the layout. Defaults to `'ltr'`. |

## LayoutEngine

| Method | Signature | Description |
| --- | --- | --- |
| `getSnapshot` | `() => EngineSnapshot` | The current immutable snapshot. Stable reference until change. |
| `subscribe` | `(listener: () => void) => () => void` | Register a listener; returns unsubscribe. |
| `setItems` | `(items: LayoutItem[]) => void` | Replace the items (auto-routes to skip / append / full). |
| `appendItems` | `(items: LayoutItem[]) => void` | Incremental append, O(added). |
| `setAlgorithm` | `(algorithm: LayoutAlgorithm) => void` | Swap the algorithm. |
| `setGap` | `(gap: Gap) => void` | Change spacing. |
| `setViewport` | `(viewport: Viewport) => void` | Change the container size. |
| `measure` | `(entries: MeasureEntry[]) => void` | Feed measured sizes back. |
| `getVisible` | `(window, options) => number[]` | Visible item indices for a scroll window. |
| `serialize` | `() => SerializedLayout` | Payload for SSR. |

## hydrateEngine

```ts
function hydrateEngine<TData>(
  serialized: SerializedLayout,
  options: { algorithm: LayoutAlgorithm; verify?: boolean },
): LayoutEngine<TData>;
```

Reproduces a serialized layout by re-running the algorithm. See
[serialization](/core/serialization/).

## Algorithms

All are factories returning a `LayoutAlgorithm`.

| Factory | Key options |
| --- | --- |
| `masonry` | `{ columns }` or `{ columnWidth }` |
| `columns` | `{ columns }` |
| `justified` | `{ targetRowHeight }` |
| `staggered` | `{ columns, stagger }` |
| `packing` | `{ baseSize }` |
| `binPacking` | `{ baseSize }` |
| `quilt` | `{ columns }` |
| `magazine` | `{ rowHeight }` |
| `horizontalMasonry` | `{ rows }` |

See [algorithms](/core/algorithms/) for the full option list and behavior of each.

## createMeasurements

```ts
function createMeasurements(options?: MeasurementsOptions): Measurements;
```

| Option | Type | Description |
| --- | --- | --- |
| `estimateHeight` | `(item, width) => number` | Height when no size, dimensions, or ratio exist. |
| `fallbackRatio` | `number` | Last-resort aspect ratio. |

## Positions

The struct-of-arrays store on `snapshot.positions`.

| Member | Type | Description |
| --- | --- | --- |
| `count` | `number` | Number of items. |
| `rectAt` | `(index: number) => Rect` | Rectangle by item index. |
| `rectOf` | `(id: ItemId) => Rect \| undefined` | Rectangle by id. |
| `idAt` | `(index: number) => ItemId` | Id at an index. |
| `indexOf` | `(id: ItemId) => number` | Index for an id. |
| `x`, `y`, `width`, `height` | `Float64Array` | Raw buffers, indexed by item order. |

## Types

```ts
type ItemId = string | number;

interface LayoutItem<TData = unknown> {
  id: ItemId;
  aspectRatio?: number;
  width?: number;
  height?: number;
  span?: number;
  data?: TData;
}

type Breakpoints = Readonly<Record<number, number>>;
type TrackCount = number | Breakpoints;

interface Rect { x: number; y: number; width: number; height: number; }
interface Size { width: number; height: number; }
interface Gap { x: number; y: number; }
type Viewport = Size;
type ScrollAxis = 'vertical' | 'horizontal';
type Direction = 'ltr' | 'rtl';

interface EngineSnapshot {
  version: number;
  positions: Positions;
  contentSize: Size;
  viewport: Viewport;
  items: readonly LayoutItem[];
}
```

`span` makes an item a square block that many cells wide and tall in `quilt`, overriding that
algorithm's own pattern. Every other algorithm ignores it - see
[hero tiles](/core/algorithms/#hero-tiles) for why.

`TrackCount` is what every `columns` (and `rows`) option accepts: a fixed number, or a map of
container width to count. See [responsive column counts](/core/algorithms/#responsive-column-counts).

`Direction` set to `'rtl'` mirrors every rect across the container in the engine, so virtualization
and drag stay correct. It is carried through `serialize`/`hydrateEngine`. See
[right-to-left](/core/algorithms/#right-to-left).

## LaynError

Every thrown error is a `LaynError` with a typed `code`, so failures (version mismatch, algorithm
mismatch, verification failure) can be handled precisely.

```ts
import { LaynError } from '@laynjs/core';

try {
  hydrateEngine(payload, { algorithm: masonry({ columns: 4 }), verify: true });
} catch (error) {
  if (error instanceof LaynError) {
    console.error(error.code, error.message);
  }
}
```
