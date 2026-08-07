---
title: Animations
description: Animate layout changes with the built-in FLIP transition layer.
---

Pass `animate: true` and every layout change animates: switching the algorithm, changing the gap or
column count, resizing the container, shuffling or filtering items, and measurement refinements after
images load. Items glide from their old position to their new one, and newly added items fade in.

```tsx
const layn = useLayn({
  items,
  algorithm: masonry({ columns: 4 }),
  animate: true,
})
```

The option is the same in every adapter except Qwik (see [limits](#limits) below). Tune it with an
options object:

```tsx
animate: { duration: 300, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
```

Both fields are optional; the values above are the defaults. `easing` accepts any CSS easing
function.

## What plays when

- **Moves** - an item whose rectangle changed animates from the old rectangle to the new one. Items
  whose position did not change are left alone.
- **Enters** - an item whose id is new to the data fades in with a slight upward drift. Items that
  merely scroll into view are **not** treated as entering, so virtualization never flickers.
- **Exits** - an item whose id left the data fades out and sinks slightly while its neighbors glide
  into place. Items that merely scroll out of view are **not** treated as exiting.
- **Nothing on mount** - the first layout after binding is applied instantly, so there is no
  fly-in cascade on page load or hydration.

## How exits work

Every framework unmounts a removed item's node immediately - by the time layn hears about the
change, the node is already out of the document. So layn animates a **clone**: it keeps a reference
to each rendered item, and when an id disappears from the data it re-inserts a copy of that node at
the position it held and fades the copy out. The clone carries a `data-layn-exiting` attribute, is
`pointer-events: none` and `aria-hidden`, drops the list-item role and position so screen readers
never count it, and is removed as soon as the fade finishes.

That keeps exits working identically in all seven adapters with no per-framework lifecycle hooks.
Two consequences worth knowing:

- The clone is inert. Event handlers, framework state, and interactive content do not survive the
  copy - it is a picture of the item on its way out.
- Style the leaving item with `[data-layn-exiting]` if you want it to look different while it goes.

## How it works

The engine already knows every item's previous and next rectangle, so the transition layer computes
deltas from data - it never measures the DOM to decide what moved. Each move plays as a Web
Animations API transform with `composite: 'add'`: the delta rides on top of the item's layout
position and decays to zero, so the animation cannot fight the positioning and always settles
exactly on the layout rectangle. Interrupting a running animation (say, shuffling twice quickly)
continues from the current visual position instead of jumping.

Because the layer drives `transform` and `opacity` only, animations run on the compositor and never
cause layout work.

## Limits

- **Qwik** has no `animate` option: the adapter renders without per-item element refs to stay
  resumable, and the transition layer needs those refs.
- The layer animates **position**, not size: an item whose width or height changes snaps to the new
  size while its position glides.
