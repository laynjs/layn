---
title: The engine
description: Create, drive, and read from a layn engine directly with @laynjs/core.
---

The engine is the stateful heart of layn. Adapters wrap it, but you can use it directly with
`@laynjs/core` alone, which is exactly what the server does during SSR.

## Creating an engine

```ts
import { createEngine, masonry } from '@laynjs/core';

const engine = createEngine({
  algorithm: masonry({ columns: 4 }),
  gap: { x: 12, y: 12 },
  viewport: { width: 960, height: 600 },
  items: [
    { id: 'a', aspectRatio: 1.5 },
    { id: 'b', aspectRatio: 0.8 },
  ],
});
```

| Option | Type | Description |
| --- | --- | --- |
| `algorithm` | `LayoutAlgorithm` | Required. One of the [nine algorithms](/core/algorithms/). |
| `items` | `LayoutItem[]` | Required. The items to lay out. |
| `gap` | `{ x, y }` | Horizontal and vertical spacing. Defaults to `0`. |
| `viewport` | `{ width, height }` | The container size. On the client the binding keeps this current. |
| `measurements` | `MeasurementsOptions` | Estimator and fallback for sizing. See [measurement](/core/measurement/). |

## Reading the layout

The engine exposes an immutable snapshot. The reference is stable until the layout changes.

```ts
const snapshot = engine.getSnapshot();
// { version, positions, contentSize, viewport, items }

snapshot.contentSize; // { width, height } of the whole grid
snapshot.positions.rectOf('a'); // { x, y, width, height }
snapshot.positions.rectAt(0); // same, by item index
```

`positions` is a struct-of-arrays store. Prefer the index accessors in hot paths:

```ts
const p = snapshot.positions;
p.count; // number of items
p.rectAt(i); // { x, y, width, height }
p.idAt(i); // the item id at index i
p.indexOf(id); // the index for an id
```

## Subscribing to changes

`subscribe` registers a listener and returns an unsubscribe function. This is what drives adapter
reactivity.

```ts
const unsubscribe = engine.subscribe(() => {
  const next = engine.getSnapshot();
  render(next);
});

unsubscribe();
```

## Updating state

Every setter recomputes the layout, but only commits a new snapshot if the result actually differs.

```ts
engine.setItems(nextItems);
engine.setAlgorithm(columns({ columns: 3 }));
engine.setGap({ x: 8, y: 8 });
engine.setViewport({ width: 1200, height: 800 });
```

- `setItems` classifies the change (identical, append, or replace) and takes the cheapest path.
- `setViewport` and `setGap` early-return when the value is unchanged.
- Passing an equivalent algorithm produces identical positions, so no snapshot is committed and no
  re-render is triggered. Memoizing the algorithm is still recommended to skip the comparison.

## Incremental append

`appendItems` continues the existing layout instead of recomputing it. Masonry is append-stable, so
the incremental result is identical to a full recompute, at O(added) cost.

```ts
engine.appendItems([{ id: 'c', aspectRatio: 1.2 }]);
```

## Feeding measured sizes back

On the client, real measured sizes refine the layout. Batch them through `measure`; the engine only
recomputes when a size actually changed.

```ts
engine.measure([
  { id: 'a', size: { width: 236, height: 300 } },
  { id: 'b', size: { width: 236, height: 180 } },
]);
```

## Virtualized visible set

`getVisible` returns the indices of items intersecting a scroll window. See
[virtualization](/core/virtualization/) for the details.

```ts
const visible = engine.getVisible({ start: 0, size: 600 }, { axis: 'vertical', overscan: 200 });
```

## Serialization

`serialize` produces a compact payload to embed in SSR HTML; `hydrateEngine` reproduces the layout on
the client by re-running the algorithm, not by trusting the serialized geometry. See
[serialization and hydration](/core/serialization/).

```ts
const payload = engine.serialize();
```

For the exact signatures of everything above, see the [API reference](/core/api/).
