---
title: Algorithms
description: The nine layout algorithms in layn, their options, and when to use each.
---

Every algorithm is a factory from `@laynjs/core`. You pass it to the engine (or the `useLayn` option)
and can swap it at runtime. All nine are SSR-deterministic and fully virtualized.

```ts
import {
  masonry,
  columns,
  justified,
  staggered,
  packing,
  binPacking,
  quilt,
  magazine,
  horizontalMasonry,
} from '@laynjs/core';
```

## masonry

Shortest-column masonry: each item flows into the currently shortest column. Variable heights, a tidy
top edge, a ragged bottom. This is the classic Pinterest layout and the default choice.

```ts
masonry({ columns: 4 });
masonry({ columnWidth: 236 }); // derive the column count from the viewport width
```

| Option | Type | Description |
| --- | --- | --- |
| `columns` | `number` | Fixed column count. |
| `columnWidth` | `number` | Target column width; the count is derived from the viewport. |

Masonry is append-stable, so `appendItems` produces the same result as a full recompute.

## columns

Fixed columns with round-robin assignment (`index % columnCount`). Unlike masonry, this preserves
source and reading order down the columns.

```ts
columns({ columns: 4 });
```

## justified

Flickr-style justified rows. Items are greedily packed into rows, then each full row is scaled to the
viewport width at roughly `targetRowHeight`. The trailing partial row is not stretched. Uses each
item's aspect ratio.

```ts
justified({ targetRowHeight: 200 });
```

## staggered

Round-robin columns with an alternating vertical brick offset, so odd columns are shifted down by a
fraction of the column width.

```ts
staggered({ columns: 4, stagger: 0.5 });
```

## packing

The skyline packer: a bottom-left algorithm placing equal-height, variable-width tiles tightly with a
ragged right edge. This is the fast, O(n) tight-packing option.

```ts
packing({ baseSize: 180 });
```

## bin-packing

The maxrects packer: a maximal-rectangles algorithm that fills earlier holes with later items, producing a visibly tighter
result than skyline. This is the premium, heaviest packer; use `packing` when you need raw speed at
very large counts.

```ts
binPacking({ baseSize: 180 });
```

## quilt

A template-driven grid. A repeating span pattern of interlocking cells (2x2, 1x2, 2x1, 1x1) is placed
by first-fit occupancy, giving an editorial, interlocking mosaic.

```ts
quilt({ columns: 4 });
```

## magazine

Editorial row templates that cycle through hero, triptych, duo, and feature rows, each with its own
weight split and height. The trailing partial row fills the width.

```ts
magazine({ rowHeight: 240 });
```

## horizontal masonry

The transpose of masonry: fixed-height rows, each item flows into the shortest row, width comes from
the aspect ratio, and content grows horizontally. Set the scroll axis to horizontal in your adapter.

```ts
horizontalMasonry({ rows: 3 });
```

## Choosing an algorithm

| Goal | Algorithm |
| --- | --- |
| Classic Pinterest grid | `masonry` |
| Preserve reading order | `columns` |
| Full-width photo rows | `justified` |
| Playful brick offset | `staggered` |
| Fast tight pack | `packing` |
| Tightest possible pack | `binPacking` |
| Interlocking mosaic | `quilt` |
| Editorial hero layouts | `magazine` |
| Horizontal scroller | `horizontalMasonry` |

## Performance

All algorithms are linear or near-linear except `binPacking`, which trades speed for pack quality. See
the [performance guide](/guides/performance/) for measured numbers up to 50,000 items.
