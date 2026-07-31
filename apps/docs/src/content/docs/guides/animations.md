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
- **Nothing on mount** - the first layout after binding is applied instantly, so there is no
  fly-in cascade on page load or hydration.

Exit animations (items animating out on removal) are not in yet: frameworks unmount removed nodes
synchronously, and keeping them alive needs the item lifecycle work planned for the drag-and-drop
release. Removed items disappear instantly while their neighbors glide into place.

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
