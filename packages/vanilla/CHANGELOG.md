# @laynjs/vanilla

## 0.5.0

### Minor Changes

- a276e6f: No functional changes. Released in lockstep with the core so every `@laynjs/*` package stays on the
  same version.

  Everything new in this release lives in `@laynjs/core` and `@laynjs/dom`, and reaches the adapters
  through the engine they already use: the stricter `LayoutItem<TData>` typing applies wherever you
  pass items, and `createDevtools` works with the `engine` each adapter exposes.

- a276e6f: The published type declarations are now documented, so your editor explains the API without a trip
  to the website.

  Every public type, option and entry point carries documentation: what an option does, what it
  defaults to, and, where it matters, why it works the way it does. Hovering `useLayn` shows a
  complete example. Hovering `entry.ref` tells you to attach it to a wrapper rather than to an
  `<img>`. Hovering `onReachEnd` explains that it is latched against the content size, so you do not
  need a guard flag of your own. `binPacking` says outright that it is the expensive one and points at
  `packing` instead.

  Nothing about the runtime changed; this is documentation shipped inside the `.d.ts` files.

### Patch Changes

- Updated dependencies [a276e6f]
- Updated dependencies [a276e6f]
- Updated dependencies [a276e6f]
- Updated dependencies [a276e6f]
  - @laynjs/adapter-utils@0.5.0
  - @laynjs/core@0.5.0
  - @laynjs/dom@0.5.0

## 0.4.0

### Minor Changes

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

- Updated dependencies [ee34763]
- Updated dependencies [dd26d83]
- Updated dependencies [7f42bd2]
- Updated dependencies [52485d8]
- Updated dependencies [635e0a9]
  - @laynjs/core@0.4.0
  - @laynjs/adapter-utils@0.4.0
  - @laynjs/dom@0.4.0

## 0.3.1

### Patch Changes

- Updated dependencies [5a0e3dc]
- Updated dependencies [5a0e3dc]
  - @laynjs/core@0.3.1
  - @laynjs/dom@0.3.1
  - @laynjs/adapter-utils@0.3.1

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
  - @laynjs/adapter-utils@0.3.0
  - @laynjs/core@0.3.0
  - @laynjs/dom@0.3.0

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
