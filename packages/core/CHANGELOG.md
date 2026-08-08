# @laynjs/core

## 0.3.1

### Patch Changes

- 5a0e3dc: No functional changes. Version kept in lockstep with the rest of the packages.

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

## 0.2.0

### Minor Changes

- 1f4f902: Version alignment only: no functional changes. `@laynjs/core` moves in lockstep so every `@laynjs/*` package shares one version.
