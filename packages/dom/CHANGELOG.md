# @laynjs/dom

## 0.3.0

### Minor Changes

- 0963d68: Live data: infinite scroll, drag to reorder, and exit animations.

  **Infinite scroll.** Pass `onReachEnd` and layn calls it as the scroll nears the end of the
  content, so you can append the next page. The callback is latched against the content size, so a
  slow or failed fetch cannot produce a burst of duplicate requests and reaching the end of your data
  simply stops the loop. It fires on the next frame, never synchronously inside a layout commit, so
  appending from inside it cannot recurse. `reachEndThreshold` tunes how early it fires (200px by
  default). Available in every adapter; Qwik takes a `QRL`.

  **Drag to reorder.** Pass `onReorder` and call `startDrag(id, event)` from a pointer event on
  whatever you want to be the handle. The held tile follows the pointer and every other tile flows
  around it, previewing the result while the pointer is still down. layn never mutates your data - it
  reports `(from, to)` and you apply the move. Escape and `pointercancel` restore the starting index.
  The held tile carries `data-layn-dragging` for styling. Not available in Qwik, which has no
  per-item element refs.

  **Exit animations.** Items removed from the data now fade out and sink while their neighbours glide
  into place, completing the transition layer shipped in 0.2. Every framework unmounts the removed
  node before layn hears about the change, so the layer animates an inert, `aria-hidden` clone marked
  `data-layn-exiting` and drops it when the fade ends.

  **Keyed diffing** now classifies a change as identical, append, prepend, insert, remove or replace,
  and reports how many items were added and removed. Removing items also evicts their cached
  measurements, which previously grew without bound in a feed that filters or paginates.

  **Fixes**

  - Items rendered in the first commit were never measured. Adapters attach the scroll binding in the
    container ref, but frameworks attach child refs before parent refs, so those items called
    `observeItem` while the binding did not exist yet and were dropped. The same applied whenever an
    option change recreated the binding. Observations are now queued and replayed.
  - Layout algorithms could emit negative track sizes when the viewport was narrower than the gaps.
  - A zero-sized measurement is ignored instead of collapsing the item permanently.
  - A measured height is trusted only while the layout still gives the item the width it was measured
    at. Because the layout writes the height onto the element and the element reports it straight
    back, a cached height could previously never be corrected, so changing the column count left every
    item at its old size.

### Patch Changes

- Updated dependencies [0963d68]
  - @laynjs/core@0.3.0

## 0.2.0

### Minor Changes

- 1f4f902: Motion: animated layout transitions, programmatic scrolling, and window scroll.

  - **`animate`** - layout changes are now animated. Items glide from their previous rectangle to the new one whenever the algorithm, gap, column count, container size, or item order changes, and items new to the data fade in. Pass `animate: true` for the defaults or `{ duration, easing }` to tune it. Deltas are computed from engine data rather than measured from the DOM, and the transforms are additive, so an animation never fights the layout and always settles exactly on the layout rectangle. Available in every adapter except Qwik, whose resumable rendering has no per-item element refs.
  - **`scrollToItem(id, options)`** and **`scrollToIndex(index, options)`** - programmatic scrolling on every adapter, with `align: 'start' | 'center' | 'end'` and an optional smooth `behavior`. The target position comes from layout data, so it works even when the item is far outside the rendered slice.
  - **`scroll: 'window'`** - drive the layout from page scroll instead of a scroll container. The container keeps its place in the document and window scroll is mapped into layout space, accounting for whatever content sits above the grid.

### Patch Changes

- Updated dependencies [1f4f902]
  - @laynjs/core@0.2.0
