---
'@laynjs/core': minor
---

`columns` (and `rows`, on `horizontalMasonry`) now accept a map of breakpoints instead of a fixed
number. The key is a minimum size, the value is the count to use from there up:

```ts
masonry({ columns: { 0: 1, 520: 2, 900: 3, 1400: 5 } });
```

These are read against the **container**, not the viewport, so the count follows the element the grid
actually lives in - a sidebar, a modal, a split pane - with no media queries and nothing to wire up:
the adapters already observe the container and recompute. Entries may be written in any order, a
breakpoint applies at its exact size, and below the smallest key the smallest entry is used. Counts
are floored and never drop below 1.

Supported by every algorithm that takes a track count: `masonry`, `columns`, `staggered`, `quilt` and
`horizontalMasonry`. Passing a plain number behaves exactly as before, as does `columnWidth`.
