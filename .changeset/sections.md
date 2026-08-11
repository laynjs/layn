---
'@laynjs/core': minor
'@laynjs/dom': minor
'@laynjs/adapter-utils': minor
'@laynjs/react': minor
'@laynjs/vue': minor
'@laynjs/svelte': minor
'@laynjs/solid': minor
'@laynjs/angular': minor
'@laynjs/vanilla': minor
---

Sections with sticky headers. Wrap any algorithm in `sections` and the grid is laid out one group at a
time, each under its own header - photos by month, tasks by status, products by category.

```ts
const isHeader = (item) => item.data?.kind === 'header';

useLayn({
  items,
  algorithm: sections(masonry({ columns: 4 }), { isHeader }),
  stickyHeaders: isHeader,
});
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
