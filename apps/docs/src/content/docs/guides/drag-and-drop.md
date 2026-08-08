---
title: Drag and drop
description: Reorder items by dragging, with every other tile flowing around the one you hold.
---

Pass `onReorder` and call `startDrag` from a pointer event on the item you want to be draggable.
layn moves the held tile with the pointer, works out which slot it is over, and asks you to apply
the new order. Every other tile glides into place through the same transition layer as the rest of
the animations.

```tsx
const [items, setItems] = useState(photos)

const layn = useLayn({
  items,
  algorithm: masonry({ columns: 4 }),
  animate: true,
  onReorder: (from, to) =>
    setItems((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    }),
})

return (
  <div {...layn.containerProps}>
    <div {...layn.contentProps}>
      {layn.items.map((entry) => (
        <div
          key={entry.id}
          ref={entry.ref}
          style={{ ...entry.style, touchAction: 'none' }}
          onPointerDown={(event) => layn.startDrag(entry.id, event.nativeEvent)}
          {...entry.a11y}
        />
      ))}
    </div>
  </div>
)
```

`touch-action: none` on the draggable element is required, otherwise the browser treats a touch
drag as a scroll and you never receive the move events.

Images and links inside a tile do not need any special handling. They start the browser's own
drag-and-drop, which would otherwise steal the gesture and cancel yours the moment you move; layn
suppresses that for as long as one of its drags is running, so a gallery works out of the box.

## You own the order

layn never mutates your data. `onReorder(from, to)` gives you two indices into the array you passed
as `items`, and it fires **during** the drag, every time the held tile moves over a different slot -
so the layout previews the result while the pointer is still down. Apply the move to your own state
and the engine follows.

Because you own the array, persisting a reorder is just your normal update path: apply the move
optimistically, send it to the server, and roll your state back if the request fails.

## Starting a drag

`startDrag(id, event)` takes the item id and a native `PointerEvent`. Wiring it yourself is what
makes the drag handle your choice:

- put the handler on the whole tile to drag from anywhere;
- put it on a small grip element inside the tile to drag only from there;
- guard it (`if (event.button !== 0) return`) to ignore right clicks.

The held tile gets a `data-layn-dragging` attribute for as long as the drag lasts, which is the hook
for styling it - a shadow, a cursor, a slight tilt.

```css
[data-layn-dragging] {
  cursor: grabbing;
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.35);
}
```

## Finishing and cancelling

Releasing the pointer drops the tile into its slot, animating the last short distance when `animate`
is on. **Escape cancels**: layn asks you to move the item back to the index it started from, so a
mistaken drag costs nothing. A `pointercancel` (the browser taking the gesture over) cancels the
same way.

Two optional callbacks report the lifecycle:

```tsx
onDragStart: (id) => setHeld(id),
onDragEnd: (id) => setHeld(undefined),
```

## How the held tile tracks the pointer

The tile is positioned by the layout like every other item, so the drag rides on top with the
separate CSS `translate` property - the layout keeps owning `transform`, and the two never fight.
After each reorder the offset is recomputed from the tile's **new** layout rectangle, which is why
the tile stays glued to the pointer instead of jumping when the grid reflows underneath it.

The held tile is also excluded from the FLIP transitions, so it never animates against your pointer.

## Limits

- **Qwik has no drag support.** It renders without per-item element refs to stay resumable, and the
  drag layer needs the element it is holding.
- **No edge auto-scroll yet.** Dragging to the top or bottom edge of a scroll container does not
  scroll it; scroll the container yourself (a wheel or trackpad gesture works mid-drag) and the
  held tile keeps tracking.
- Reordering is a **single flat list**. Dragging between two separate grids is not supported.
