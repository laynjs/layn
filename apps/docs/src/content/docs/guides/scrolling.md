---
title: Scrolling
description: Scroll to items programmatically, and drive the layout from page scroll.
---

## Scroll to an item

Every adapter returns `scrollToItem(id, options?)` and `scrollToIndex(index, options?)`:

```tsx
const layn = useLayn({ items, algorithm: masonry({ columns: 4 }) })

layn.scrollToItem(42, { align: 'center', behavior: 'smooth' })
layn.scrollToIndex(0)
```

- `align` - where the item lands in the viewport: `'start'` (default), `'center'`, or `'end'`.
- `behavior` - any CSS `scroll-behavior` value; pass `'smooth'` for an animated scroll.

The target position comes from the engine's own layout data, so it works even when the item is far
outside the rendered slice - virtualization mounts it as the scroll arrives. Unknown ids and
out-of-range indices are safe no-ops. In vanilla the same methods live on the `createLayn` instance.

## Window scroll

By default the layout scrolls inside its own container. Pass `scroll: 'window'` to let the whole
page scroll instead - the container element stays where it is in the document, and layn maps page
scroll into layout space, accounting for whatever content sits above the grid:

```tsx
const layn = useLayn({
  items,
  algorithm: masonry({ columns: 4 }),
  scroll: 'window',
})
```

In this mode the container no longer gets `overflow: auto`, the viewport tracks the window size, and
`scrollToItem` scrolls the page. Everything else - virtualization, measurement, animations - works
the same.
