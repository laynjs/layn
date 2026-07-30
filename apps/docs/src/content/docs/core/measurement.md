---
title: Measurement
description: How layn sizes items before and after the DOM exists, and how to tune it.
---

Every algorithm needs a size for every item. layn resolves that size with a fixed, data-first
strategy so the server and client agree, then refines on the client after paint.

## Resolution order

For each item, layn uses the first source that applies:

1. **DOM-measured size** - cached from a `ResizeObserver` once the item has rendered (client only).
2. **Provided `width` and `height`** on the item.
3. **`aspectRatio`** on the item, scaled to the resolved column width.
4. **An `estimateHeight` function**, if you provide one.
5. **A `fallbackRatio`.**

On the server, step 1 is unavailable, so sizing starts at step 2. This is deliberate: the client
begins from the exact same rectangles the server produced, then step 1 quietly corrects anything the
data got slightly wrong.

## Sizing your items

The most common approach is an aspect ratio, which is resolution-independent:

```ts
const items = photos.map((photo) => ({
  id: photo.id,
  aspectRatio: photo.width / photo.height,
}));
```

If you already know pixel dimensions, provide them directly:

```ts
const items = tiles.map((tile) => ({
  id: tile.id,
  width: tile.w,
  height: tile.h,
}));
```

For row-based algorithms like `justified`, the aspect ratio is what drives the layout, so prefer it.

## Tuning the estimator and fallback

Pass `measurements` to `createEngine` (or the adapter option) to control steps 4 and 5:

```ts
import { createEngine, createMeasurements, masonry } from '@laynjs/core';

const measurements = createMeasurements({
  estimateHeight: (item, width) => width * 1.25,
  fallbackRatio: 1,
});

const engine = createEngine({
  algorithm: masonry({ columns: 4 }),
  items,
  measurements,
});
```

| Option | Type | Description |
| --- | --- | --- |
| `estimateHeight` | `(item, width) => number` | Used when an item has no measured size, dimensions, or aspect ratio. |
| `fallbackRatio` | `number` | Last-resort aspect ratio when nothing else applies. |

## Refining on the client

Adapters wire item refs to a `ResizeObserver` for you: as each item renders, its real size flows back
into the engine and the layout settles onto measured heights. If you drive the engine yourself, batch
the sizes through `measure`:

```ts
engine.measure([{ id: 'a', size: { width: 236, height: 312 } }]);
```

The engine only recomputes when a size actually changed, so feeding stable sizes is cheap.

:::tip
Give every item an `aspectRatio` even when you plan to measure. It makes the first server render
correct, which is what removes layout shift. Measurement then refines, it does not bootstrap.
:::
