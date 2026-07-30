---
title: Accessibility
description: The accessibility contract every layn adapter emits, and how to use it.
---

Virtualized grids are hostile to assistive technology by default: most of the items are not in the
DOM, so a screen reader cannot tell how many there are or where it is in the collection. layn fixes
this in every adapter.

## The contract

Given the DOM shape scroll container, then a content wrapper, then items, layn emits:

- **Scroll container**: `tabindex="0"` so keyboard users can focus and scroll it, plus
  `role="region"` and `aria-label` when you pass a `label`.
- **Content wrapper**: `role="list"`. It sits directly around the items, which keeps the list and
  listitem relationship valid.
- **Each item**: `role="listitem"`, `aria-setsize` (the true total item count), and `aria-posinset`
  (its one-based position). This is the key fix: assistive tech announces "item 42 of 5000" even though
  only a dozen items are in the DOM.

## Turning it on

It is on by default. Spread the provided attributes onto the right elements, and pass a `label` for the
region's accessible name.

```tsx
const layn = useLayn({ items, algorithm: masonry({ columns: 4 }), label: 'Photo gallery' });

// container: {...layn.containerProps}  (React folds tabindex + role + aria-label in)
// content:   {...layn.contentProps}    (role="list")
// item:      {...entry.a11y}           (role, aria-setsize, aria-posinset)
```

In Vue, Svelte, Solid, and Qwik these are `containerAttrs`, `contentAttrs`, and `entry.a11y`. In
Angular they are bound with `[attr.role]`, `[attr.aria-setsize]`, and so on, because templates have no
object spread. See each [adapter page](/adapters/overview/) for the exact syntax.

## The label

`label` becomes the region's `aria-label`. It is worth setting even when there is no visible heading:
the region still gets an accessible name, so screen-reader users can identify and navigate to it.

```ts
useLayn({ items, algorithm: masonry({ columns: 4 }), label: 'Search results' });
```

## Keyboard scrolling

The `tabindex="0"` on the container makes it a focusable scroll region, so keyboard users can tab to
the grid and scroll it with the arrow keys, Page Up/Down, and Home/End. No extra work.

## Overriding

The attributes are plain data. If your markup needs different semantics (a `feed`, or native `<ul>`
and `<li>` where roles are implicit), spread layn's attributes first and set your own after, or simply
do not spread the ones you want to replace.
