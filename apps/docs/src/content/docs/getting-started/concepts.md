---
title: Core concepts
description: The engine, hybrid measurement, struct-of-arrays storage, and virtualization that make layn deterministic and fast.
---

layn is small, but a few ideas explain everything it does. Understanding them makes the API obvious.

## The engine is a pure function of state

At the center is one transformation:

```
(items + config + measurements) -> positions + contentSize
```

Given your items, a configuration (algorithm, gap, viewport), and whatever measurements are known,
the engine produces a position for every item and the total size of the content. There is no DOM in
this function and no framework. That is what "headless" means here: the engine decides *where* things
go, and your framework decides *how* they are drawn.

## SSR determinism

Because positions come from data rather than from measuring the DOM, the server and the client
compute the *same* rectangles. The server has no DOM, but it has your items and their aspect ratios,
so it can lay everything out and send fully positioned HTML. When the client hydrates, it recomputes
the identical layout and matches the markup exactly.

The result: no hydration mismatch and no cumulative layout shift. The grid is correct on the first
paint, before a single image loads.

## Hybrid measurement

Every item needs a size. layn resolves it in a fixed order, most trusted first:

1. **DOM-measured size** (from a `ResizeObserver`, cached once the item has rendered).
2. **Provided `width`/`height`** on the item.
3. **`aspectRatio`** on the item, scaled to the column width.
4. **An estimator** function, if you supply one.
5. **A fallback ratio.**

The first four are all available on the server (there is no DOM measurement server-side, so it starts
at step 2). The client adds step 1 after paint to refine anything the data got slightly wrong. This is
why the same data yields the same layout everywhere, then quietly self-corrects on the client.

## Struct-of-arrays storage

Positions are not stored as an array of `{ x, y, width, height }` objects. They live in flat
`Float64Array` buffers, indexed by item order, behind a `Positions` accessor. Individual rectangles
are materialized lazily with `rectAt(i)` or `rectOf(id)`.

This is the main performance lever. Appending items reuses shared, append-only buffers, so adding to a
large grid is amortized O(added) rather than O(total). It is also why layn needs no WebAssembly: the
bottleneck in layout is allocation and memory traffic, not arithmetic, and flat typed arrays solve
that in plain TypeScript.

## Virtualization is a separate layer

Layout decides where every item *would* go. Virtualization decides which of them are *on screen*. A
spatial index, bucketed along the scroll axis, answers "which items intersect this scroll window" in
microseconds, at any scale. Your adapter renders only that slice and updates it as you scroll.

Virtualization works identically for all nine algorithms, because it operates on the computed
positions, not on the algorithm that produced them.

## The immutable snapshot

The engine exposes its state as an immutable snapshot:

```ts
const snapshot = engine.getSnapshot();
// { version, positions, contentSize, viewport, items }
```

The snapshot reference is stable until something actually changes, which is what lets adapters drive
`useSyncExternalStore` (React) and equivalent primitives without extra work. Calls that would produce
an identical layout do not commit a new snapshot, so an equivalent algorithm never triggers a render
loop.

## Where each piece lives

- **`@laynjs/core`** is the engine, the algorithms, measurement, and serialization. No dependencies, no
  DOM.
- **`@laynjs/dom`** adds the browser: `ResizeObserver` measurement, scroll tracking, and the binding
  that connects a real scroll container to the engine.
- **The adapters** wrap all of that in your framework's idioms.

Next: read about [the engine API](/core/engine/) or the [algorithms](/core/algorithms/).
