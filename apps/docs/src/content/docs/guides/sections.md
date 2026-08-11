---
title: Sections
description: Group items under headers that stick to the top while their section scrolls.
---

Wrap any algorithm in `sections` and the grid is laid out one group at a time, each under its own
header: photos by month, tasks by status, products by category.

```tsx
import { masonry, sections } from '@laynjs/core';

const isHeader = (item) => item.data?.kind === 'header';

const items = [
  { id: 'jan', height: 44, data: { kind: 'header', title: 'January' } },
  { id: 1, aspectRatio: 1.5, data: { src: '...' } },
  { id: 2, aspectRatio: 0.8, data: { src: '...' } },
  { id: 'feb', height: 44, data: { kind: 'header', title: 'February' } },
  { id: 3, aspectRatio: 1.2, data: { src: '...' } },
];

const layn = useLayn({
  items,
  algorithm: sections(masonry({ columns: 4 }), { isHeader }),
  stickyHeaders: isHeader,
});
```

## Headers are items

There is no separate header list and no new field on `LayoutItem`. A header is an ordinary item that
your predicate recognises, and **everything after it belongs to its section until the next header**.

That falls out of how layn works rather than being a stylistic choice: `getVisible` returns indices
into your item array, so the positions and the items have to line up one for one. Making headers real
items means they are virtualized, measured, animated and serialized exactly like everything else, with
no special path anywhere.

It also means the header carries its own content. Give it a `height` and render it however you like:

```tsx
{layn.items.map((entry) =>
  entry.item.data?.kind === 'header' ? (
    <h2 key={entry.id} ref={entry.ref} style={entry.style}>
      {entry.item.data.title}
    </h2>
  ) : (
    <Tile key={entry.id} entry={entry} />
  ),
)}
```

A header laid out by `sections` always spans the full container width. Items that appear before the
first header form a leading section with no header of their own.

:::caution
Give a header item a `height` and **no** `aspectRatio`, or the aspect ratio wins and the header
becomes as tall as the grid is wide. See [measurement](/core/measurement/) for the resolution order.
:::

## The inner algorithm restarts per section

This is the point of the feature. `sections(masonry({ columns: 4 }), …)` runs masonry **separately**
for each group, so a section's columns start level instead of continuing from wherever the previous
group happened to end. Any algorithm composes:

```ts
sections(justified({ targetRowHeight: 200 }), { isHeader });
sections(quilt({ columns: 4 }), { isHeader });
```

`sectionGap` sets the space between one section and the next header; it defaults to the vertical
`gap`.

Because each group is laid out on its own, `sections` cannot append incrementally and reports
`capabilities.incremental: false`. A full recompute of a grouped layout is still linear in the number
of items.

## Sticky headers

Pass the same predicate as `stickyHeaders` and the current section's header is held at the top of the
scroll container, then pushed out by the next one as it arrives.

layn does this by writing the CSS `translate` property, which leaves `transform` to the layout so the
two never fight - and it keeps the pinned header **mounted** even after its own rectangle has scrolled
out of view, which plain virtualization would otherwise unmount.

`position: sticky` cannot do this job here: items are absolutely positioned, and sticky only works on
elements in normal flow.

The pinned header gets `data-layn-stuck` for as long as it is held, which is the hook for styling the
pinned state - a shadow, a solid background, a border:

```css
.section-header {
  background: var(--page-bg);
}

.section-header[data-layn-stuck] {
  box-shadow: 0 1px 0 rgb(0 0 0 / 0.12);
}
```

Give the header a background. It sits above the tiles while pinned, and a transparent one will show
them through it.

## Limits

- **Qwik has no sticky headers.** It renders without per-item element refs to stay resumable, and the
  sticky layer needs the element it is holding. `sections` itself works there - only the pinning does
  not.
- Sections are **flat**. There is no nesting, and a section is a contiguous run of items: the same
  header cannot appear twice.
- Sticky applies to the vertical axis, alongside the rest of `sections`.
