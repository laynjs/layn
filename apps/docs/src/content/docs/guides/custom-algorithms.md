---
title: Write your own algorithm
description: A layout algorithm in layn is one function. Build a complete one, with RTL and responsive columns, in about 30 lines.
---

The nine built-in algorithms are not privileged. They are ordinary values built from the same public
API you have, and the engine will run yours exactly as it runs `masonry`. If you can express your
layout as "given these items and this width, where does each one go", you can ship it.

## The contract

```ts
interface LayoutAlgorithm {
  readonly name: string;
  readonly capabilities: { incremental: boolean; requiresMeasuredHeight: boolean };
  layout(items: readonly LayoutItem[], context: LayoutContext, previous?: LayoutResult): LayoutResult;
}
```

`layout` receives every item and a context of `{ viewport, gap, measurements, direction }`, and
returns `{ positions, contentSize }`. That is the whole interface. There is no DOM in it, which is
what lets the same call run on your server.

## A complete algorithm

This is `shelf`: rows of a fixed height, each item keeping its own aspect ratio, wrapping to a new
row when the current one runs out of width. Think of a bookshelf, or a film strip that wraps.

```ts
import { createPositionsBuilder, mirrorExtent } from '@laynjs/core';
import type { LayoutAlgorithm, LayoutContext, LayoutItem, LayoutResult } from '@laynjs/core';

export const shelf = (options: { rowHeight?: number } = {}): LayoutAlgorithm => ({
  name: 'shelf',
  capabilities: { incremental: false, requiresMeasuredHeight: false },

  layout(items: readonly LayoutItem[], context: LayoutContext): LayoutResult {
    const { viewport, gap, measurements } = context;
    const rowHeight = options.rowHeight ?? 200;
    const builder = createPositionsBuilder(items.length, mirrorExtent(context));
    let x = 0;
    let y = 0;

    for (const item of items) {
      const width = measurements.aspectRatio(item) * rowHeight;
      if (x > 0 && x + width > viewport.width) {
        x = 0;
        y += rowHeight + gap.y;
      }
      builder.push(item.id, x, y, width, rowHeight);
      x += width + gap.x;
    }

    return {
      positions: builder.build(),
      contentSize: { width: viewport.width, height: y + rowHeight },
    };
  },
});
```

That is the finished thing. Use it like any built-in:

```tsx
const layn = useLayn({ items, algorithm: shelf({ rowHeight: 180 }), gap: { x: 10, y: 10 } });
```

You now have virtualization, SSR determinism, animation, `scrollToItem`, drag and drop and sticky
sections on a layout you wrote yourself, because all of those read `positions` and none of them care
where the numbers came from.

## The pieces

**`createPositionsBuilder(capacity, mirror?)`** is the fast path into the engine's storage. Positions
live in flat `Float64Array` buffers, so pushing a rectangle writes four numbers rather than
allocating an object. Give it the item count as the capacity; it grows if you push more.

**`builder.push(id, x, y, width, height)`** places one item. Push in item order: the engine relies on
position `i` belonging to item `i`, which is what makes virtualization an array index rather than a
lookup.

**`measurements`** answers how big an item is without touching the DOM. `aspectRatio(item)` gives
width over height; `size(item, availableWidth)` gives a concrete `{ width, height }` for a given
column width. Both walk the [resolution order](/core/measurement/): a real measurement if the browser
has reported one, then the item's own dimensions, then its aspect ratio, then your estimator.

**`contentSize`** is the scrollable extent. Get it wrong and the scrollbar lies, so return the real
bottom of the last row, not an estimate.

## Right-to-left, free

`mirrorExtent(context)` returns the container width when `direction` is `'rtl'` and `undefined`
otherwise. Passing it to the builder makes every `push` mirror as it is written, so you keep writing
plain left-to-right maths and the layout flips for you.

Mirroring happens in the engine rather than in CSS on purpose: hit-testing for drag and drop,
`scrollToItem` and the spatial index all read the same numbers your algorithm produced. See
[right-to-left](/core/algorithms/#right-to-left).

## Responsive column counts

If your algorithm works in columns, reuse the resolver the built-ins use and you accept a breakpoint
map for free:

```ts
import { resolveColumnCount, resolveTrackSize } from '@laynjs/core';

const columnCount = resolveColumnCount(options, viewport.width, gap.x);
const columnWidth = resolveTrackSize(viewport.width, columnCount, gap.x);
```

`options` may carry `columns` (a number or a `{ minWidth: count }` map), `columnWidth` and
`maxColumns`, and the count is resolved against the container. `resolveRowCount` is the horizontal
twin. See [responsive column counts](/core/algorithms/#responsive-column-counts).

## The rules

There is only one hard rule, and everything good about layn depends on it: **the same inputs must
produce the same output, on the server and on the client.**

In practice that means no `Math.random()`, no `Date.now()`, no reading from the DOM, and no state
outside the arguments you were handed. If you want variety, derive it from the item's index or id:

```ts
const jitter = ((index * 2654435761) % 100) / 100;
```

Break the rule and you get a hydration mismatch, which is exactly the class of bug the engine exists
to remove.

## Declaring capabilities honestly

```ts
capabilities: { incremental: false, requiresMeasuredHeight: false }
```

`requiresMeasuredHeight` says whether your layout needs a real measured height to be correct.
`shelf` does not: every tile is `rowHeight` tall, so the first server-rendered frame is already final.
Masonry does, because column heights accumulate.

`incremental` says you can continue from a previous result instead of recomputing. Leave it `false`
unless you have actually implemented it. A full recompute is well under a millisecond for tens of
thousands of items, so this is an optimisation, not a requirement.

## Continuing from a previous layout

If you do want appends to be O(added), return a `state` from `layout` and read the `previous`
argument on the next call:

```ts
layout(items, context, previous) {
  const state = previous?.state as ShelfState | undefined;
  const canContinue = state !== undefined && state.viewportWidth === context.viewport.width;
  ...
}
```

`state` is opaque to the engine: it stores whatever you return and hands it straight back. Always
verify it is still valid (the container width, the column count, whatever your layout depends on) and
fall back to a full layout when it is not. This is how `masonry` appends without touching the items
it already placed.

## Testing it

The tests worth writing are the invariants, not the coordinates:

```ts
it('never overlaps and never leaves the container', () => {
  const result = shelf({ rowHeight: 100 }).layout(items, context);
  for (let i = 0; i < result.positions.count; i += 1) {
    const rect = result.positions.rectAt(i);
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(context.viewport.width + 0.01);
  }
});

it('is deterministic', () => {
  const a = shelf().layout(items, context);
  const b = shelf().layout(items, context);
  expect(Array.from(a.positions.x)).toEqual(Array.from(b.positions.x));
});
```

Running the algorithm twice and comparing the buffers is the cheapest possible guard against the
determinism rule, and it is the test that would have caught every SSR bug we have ever had.

## Sharing it

An algorithm is a plain value with no dependency on a framework, so publishing one is publishing a
function that returns an object. If you build something good, open a pull request or an issue on
[GitHub](https://github.com/laynjs/layn) and we will link it.
