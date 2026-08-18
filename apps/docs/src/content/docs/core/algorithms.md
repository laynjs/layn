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
masonry({ columnWidth: 236 }); // derive the column count from the container width
masonry({ columns: { 0: 2, 900: 3, 1400: 4 } }); // or from breakpoints
```

| Option | Type | Description |
| --- | --- | --- |
| `columns` | `number` \| `Breakpoints` | Fixed column count, or a [breakpoint map](#responsive-column-counts). |
| `columnWidth` | `number` | Target column width; the count is derived from the container. |
| `maxColumns` | `number` | Upper bound when the count comes from `columnWidth`. |

Masonry is append-stable, so `appendItems` produces the same result as a full recompute.

## columns

Fixed columns with round-robin assignment (`index % columnCount`). Unlike masonry, this preserves
source and reading order down the columns.

```ts
columns({ columns: 4 });
```

Takes the same [responsive `columns`](#responsive-column-counts) as masonry.

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

### Hero tiles

An item can declare its own size instead of taking the next slot in the pattern. Give it a `span` and
it becomes a square block that many cells wide and tall - the hero image in a gallery, the featured
card in a dashboard:

```ts
const items = [
  { id: 'a', span: 2 }, // a 2x2 block
  { id: 'b' }, // follows the pattern
  { id: 'c' },
];
```

`span` is clamped to the grid, so a `span: 4` item stays valid when a narrow viewport drops the layout
to two columns - it simply fills the width. Fractions are floored and anything below `1` becomes `1`.

**Quilt is the algorithm to reach for when you want a hero tile and no empty space.** Its cells are a
fixed size, so a block of them fits exactly and the first-fit placement flows smaller items into
whatever is left. Nothing is ever left blank except the last partial rows.

This is also why `span` does nothing in `masonry`. There, each column grows by whatever height its
items happen to have, so two columns essentially never end level - and a rigid two-column item needs
one flat line to sit on. The difference between the two columns would become an empty patch. Masonry
keeps its aspect ratios and its tight packing; quilt gives up the aspect ratios and gets exact spans
in return. `span` is ignored by every algorithm other than `quilt`.

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

`rows` accepts [breakpoints](#responsive-column-counts) too, read against the container **height**.

## Sections

Any algorithm can be wrapped so the grid is laid out one group at a time, each under its own header:

```ts
sections(masonry({ columns: 4 }), { isHeader: (item) => item.data?.kind === 'header' });
```

The inner algorithm restarts for every section, so a group's columns begin level instead of continuing
from the previous one. Headers are ordinary items your predicate recognises, and they can be pinned
while their section scrolls. See the [sections guide](/guides/sections/).

## Responsive column counts

Anywhere an algorithm takes `columns` (or `rows`, for `horizontalMasonry`) you can hand it a map of
breakpoints instead of a number. The key is a minimum width, the value is the count to use from there
up:

```ts
masonry({
  columns: { 0: 1, 520: 2, 900: 3, 1400: 5 },
});
```

**These are container widths, not viewport widths.** The engine lays out into whatever box your scroll
container has, so the count follows the element the grid actually lives in - a sidebar, a modal, a
split pane - without a single media query. Resizing the container is enough; the adapters already
observe it and recompute.

Entries can be written in any order. A breakpoint applies at its exact width, so `520: 2` gives two
columns from 520px up. Below the smallest key the smallest entry is used, so add a `0:` entry when you
want to be explicit about the narrowest case. Counts are floored and never drop below `1`.

The alternative is `columnWidth`, which derives the count from a target column size and needs no
breakpoints at all:

```ts
masonry({ columnWidth: 236, maxColumns: 6 });
```

Reach for `columnWidth` when you care that tiles stay near a certain size, and for breakpoints when
you want exact control over the count at each size. If both are given, the breakpoints win.

## Right-to-left

Pass `direction: 'rtl'` and the layout is mirrored across the container: the first item sits against
the right edge, columns fill leftwards, and a ragged edge falls on the left.

```ts
useLayn({
  items,
  algorithm: masonry({ columns: 4 }),
  direction: 'rtl',
});
```

The mirroring happens in the engine, not in CSS, which is what makes everything else keep working:
virtualization, scroll-to, hit-testing and drag-and-drop all run on the same coordinates the browser
paints, so a dragged tile still lands where you dropped it. You do not need `direction: rtl` on the
container for the geometry - though you will still want it (or on `<html>`) so the **text** inside
your tiles runs the right way.

The vertical layout is untouched: every rect keeps its `y`, `width` and `height`, and only `x` flips.
Content size is identical, so a right-to-left grid is exactly as tall as its left-to-right twin.

`direction` is read when the engine is created and does not change afterwards. Locale changes almost
always remount the tree anyway; if yours does not, remount the grid.

Every algorithm mirrors except **`horizontalMasonry`**, which is deliberately left alone: its content
grows past the container, so there is no fixed width to mirror against and every append would shift
everything already placed. Reverse a horizontal scroller with CSS `direction: rtl` on the scroll
container and let the browser flip the scroll axis.

## Choosing an algorithm

| Goal | Algorithm |
| --- | --- |
| Classic Pinterest grid | `masonry` |
| Preserve reading order | `columns` |
| Full-width photo rows | `justified` |
| Playful brick offset | `staggered` |
| Fast tight pack | `packing` |
| Tightest possible pack | `binPacking` |
| Interlocking mosaic, or hero tiles with no empty space | `quilt` |
| Editorial hero layouts | `magazine` |
| Horizontal scroller | `horizontalMasonry` |
| None of the above | [write your own](/guides/custom-algorithms/) |

## Performance

All algorithms are linear or near-linear except `binPacking`, which trades speed for pack quality. See
the [performance guide](/guides/performance/) for measured numbers up to 50,000 items.
