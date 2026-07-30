---
title: Virtualization
description: Render only the items on screen at any scale with layn's spatial index.
---

Virtualization is a layer on top of layout. Layout decides where every item would go; virtualization
decides which of them are actually on screen right now. Only those are rendered.

## The visible set

`getVisible` takes a scroll window and returns the **indices** of the items that intersect it. It
returns indices (not ids) so adapters can read `items[i]` and `positions.rectAt(i)` in O(1) without
touching the lazy id lookup.

```ts
const visible = engine.getVisible(
  { start: scrollTop, size: viewportHeight },
  { axis: 'vertical', overscan: 200 },
);

for (const index of visible) {
  const rect = engine.getSnapshot().positions.rectAt(index);
  // render items[index] at rect
}
```

| Argument | Type | Description |
| --- | --- | --- |
| `window.start` | `number` | The scroll offset along the axis. |
| `window.size` | `number` | The viewport length along the axis. |
| `options.axis` | `'vertical' \| 'horizontal'` | The scroll direction. Match your algorithm. |
| `options.overscan` | `number` | Extra pixels rendered beyond the viewport, both sides. |

## How it stays fast

Behind `getVisible` is a spatial index that buckets items into bands along the scroll axis. A query
walks only the bands the window touches, so answering "what is visible" is microseconds even with
100,000 items. The index is cached per snapshot version and rebuilt only when the layout changes.

Because it operates on computed positions, virtualization is identical for all nine algorithms and for
both axes.

## Overscan

`overscan` renders a margin of items just outside the viewport so fast scrolling never shows blank
space before the next items mount. A value around half the viewport length is a good starting point.
Larger values render more items but scroll more smoothly.

## In an adapter

You rarely call `getVisible` yourself. The adapters bind a scroll container, throttle scroll with
`requestAnimationFrame`, and expose only the visible slice as `layn.items`. You render that slice; the
adapter swaps it as you scroll. See any [adapter page](/adapters/overview/) for the wiring.

## Horizontal virtualization

Set `axis: 'horizontal'` (and use `horizontalMasonry`, or any algorithm with a horizontal container)
and the same spatial index virtualizes along the x-axis instead. Adapters expose an `axis` option that
sets this for both the binding and the visible-set query.
