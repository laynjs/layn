# @laynjs/core

## 0.4.0

### Minor Changes

- ee34763: `quilt` now honours a per-item `span`. An item that declares one becomes a square block that many
  cells wide and tall, overriding the algorithm's repeating pattern - the hero image in a gallery, the
  featured card in a dashboard. It is clamped to the grid, so a `span: 4` item stays valid when a narrow
  viewport drops the layout to two columns.

  Quilt is where this belongs: its cells are a fixed size, so a block of them fits exactly and smaller
  items flow into whatever is left, leaving no empty space. Column-based algorithms like `masonry` grow
  each column by whatever height its items happen to have, so a rigid multi-column item would need a
  flat line that is essentially never there, and the difference would show as a gap. `span` continues to
  be ignored by every algorithm other than `quilt`.

  `span` has been part of the `LayoutItem` type since the first release but no algorithm implemented it
  until now.

- 7f42bd2: `columns` (and `rows`, on `horizontalMasonry`) now accept a map of breakpoints instead of a fixed
  number. The key is a minimum size, the value is the count to use from there up:

  ```ts
  masonry({ columns: { 0: 1, 520: 2, 900: 3, 1400: 5 } })
  ```

  These are read against the **container**, not the viewport, so the count follows the element the grid
  actually lives in - a sidebar, a modal, a split pane - with no media queries and nothing to wire up:
  the adapters already observe the container and recompute. Entries may be written in any order, a
  breakpoint applies at its exact size, and below the smallest key the smallest entry is used. Counts
  are floored and never drop below 1.

  Supported by every algorithm that takes a track count: `masonry`, `columns`, `staggered`, `quilt` and
  `horizontalMasonry`. Passing a plain number behaves exactly as before, as does `columnWidth`.

- 52485d8: Right-to-left layouts. Pass `direction: 'rtl'` and the grid is mirrored across the container: the
  first item sits against the right edge, columns fill leftwards, and any ragged edge falls on the left.

  ```ts
  useLayn({ items, algorithm: masonry({ columns: 4 }), direction: 'rtl' })
  ```

  The mirroring happens in the engine rather than in CSS, which is what keeps everything else working:
  virtualization, `scrollToItem`, hit-testing and drag-to-reorder all run on the same coordinates the
  browser paints, so a dragged tile still lands where you dropped it. Only `x` flips - `y`, `width`,
  `height` and the content size are untouched, so a right-to-left grid is exactly as tall as its
  left-to-right twin. The direction is carried through `serialize`/`hydrateEngine`, so SSR stays
  deterministic.

  Supported by every algorithm except `horizontalMasonry`, whose content grows past the container: there
  is no fixed width to mirror against, and every append would shift everything already placed. Reverse a
  horizontal scroller with CSS `direction: rtl` on the scroll container instead.

  `direction` is read when the engine is created and does not change afterwards.

- 635e0a9: Sections with sticky headers. Wrap any algorithm in `sections` and the grid is laid out one group at a
  time, each under its own header - photos by month, tasks by status, products by category.

  ```ts
  const isHeader = (item) => item.data?.kind === 'header'

  useLayn({
    items,
    algorithm: sections(masonry({ columns: 4 }), { isHeader }),
    stickyHeaders: isHeader,
  })
  ```

  The inner algorithm restarts for every group, so a section's columns begin level instead of continuing
  from wherever the previous one ended. Any algorithm composes.

  A header is an ordinary item that your predicate recognises, and everything after it belongs to its
  section until the next header. There is no separate header list and no new field on `LayoutItem`, so
  headers are virtualized, measured, animated and serialized like every other item.

  `stickyHeaders` pins the current section's header to the top of the scroll container and lets the next
  one push it out. It writes the CSS `translate` property, leaving `transform` to the layout, and keeps
  the pinned header mounted after its own rectangle has scrolled out of view - which plain
  virtualization would otherwise unmount, and which `position: sticky` cannot do for absolutely
  positioned items. The held header carries `data-layn-stuck` for styling.

  Sticky headers are unavailable in Qwik, which renders without per-item element refs; `sections` itself
  works there.

### Patch Changes

- dd26d83: Documentation: a Recipes section with three complete examples - a photo gallery, an infinite feed, and
  a dashboard - each combining the layout features into a component you can copy whole.

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
