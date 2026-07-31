# @laynjs/vue

## 0.2.0

### Minor Changes

- 1f4f902: Motion: animated layout transitions, programmatic scrolling, and window scroll.

  - **`animate`** - layout changes are now animated. Items glide from their previous rectangle to the new one whenever the algorithm, gap, column count, container size, or item order changes, and items new to the data fade in. Pass `animate: true` for the defaults or `{ duration, easing }` to tune it. Deltas are computed from engine data rather than measured from the DOM, and the transforms are additive, so an animation never fights the layout and always settles exactly on the layout rectangle. Available in every adapter except Qwik, whose resumable rendering has no per-item element refs.
  - **`scrollToItem(id, options)`** and **`scrollToIndex(index, options)`** - programmatic scrolling on every adapter, with `align: 'start' | 'center' | 'end'` and an optional smooth `behavior`. The target position comes from layout data, so it works even when the item is far outside the rendered slice.
  - **`scroll: 'window'`** - drive the layout from page scroll instead of a scroll container. The container keeps its place in the document and window scroll is mapped into layout space, accounting for whatever content sits above the grid.

### Patch Changes

- Updated dependencies [1f4f902]
- Updated dependencies [1f4f902]
  - @laynjs/core@0.2.0
  - @laynjs/adapter-utils@0.2.0
  - @laynjs/dom@0.2.0
