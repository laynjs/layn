---
title: Dashboard
description: A grid of cards with hero tiles and drag-to-reorder, on a layout that never leaves a hole.
---

Dashboards want something galleries do not: **no empty patches**. A photo wall can be ragged and still
look intentional; a grid of cards cannot. That is what decides the algorithm here.

```tsx
import { quilt } from '@laynjs/core';
import { useLayn } from '@laynjs/react';
import { useState } from 'react';

export function Dashboard({ initial }) {
  const [cards, setCards] = useState(initial);

  const layn = useLayn({
    items: cards,
    algorithm: quilt({ columns: { 0: 2, 900: 3, 1400: 4 } }),
    gap: { x: 14, y: 14 },
    animate: true,
    label: 'Dashboard',
    onReorder: (from, to) =>
      setCards((current) => {
        const next = [...current];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      }),
  });

  return (
    <div {...layn.containerProps} className="board">
      <div {...layn.contentProps}>
        {layn.items.map((entry) => (
          <section
            key={entry.id}
            ref={entry.ref}
            style={{ ...entry.style, touchAction: 'none' }}
            className="card"
            {...entry.a11y}
          >
            <header onPointerDown={(event) => layn.startDrag(entry.id, event.nativeEvent)}>
              {entry.item.data.title}
            </header>
            <Widget widget={entry.item.data} />
          </section>
        ))}
      </div>
    </div>
  );
}
```

## Why quilt and not masonry

`quilt` lays out on fixed square cells, so a card that asks for two cells gets exactly two, and
smaller cards flow into whatever is left. Nothing is ever blank.

Masonry cannot do that. Its columns grow by whatever height their items happen to have, so two columns
essentially never end level - and a card spanning two of them needs a flat line to sit on. The
difference between the columns becomes an empty patch. That is why `span` does nothing in masonry;
the full reasoning is under [hero tiles](/core/algorithms/#hero-tiles).

## Hero cards

A card declares its own size with `span`, and it becomes a square block that many cells wide and tall:

```ts
const cards = [
  { id: 'revenue', span: 2, data: { title: 'Revenue' } },
  { id: 'signups', data: { title: 'Signups' } },
  { id: 'churn', data: { title: 'Churn' } },
  { id: 'map', span: 3, data: { title: 'Regions' } },
];
```

`span` is clamped to the grid, so `span: 3` stays valid when a narrow screen drops the layout to two
columns - it just fills the width. Cards without a `span` follow quilt's own pattern; pass
`quilt({ pattern: [[1, 1]] })` if you want a flat grid where only your hero cards stand out.

## Drag from the header, not the card

Putting `startDrag` on the card's `<header>` rather than the whole card leaves the card's own contents
clickable - buttons, links, a chart you can hover:

```tsx
<header onPointerDown={(event) => layn.startDrag(entry.id, event.nativeEvent)}>
```

`touch-action: none` on the draggable element is required, or a touch drag is treated as a scroll.

`onReorder` fires **during** the drag, every time the held card moves over a different slot, so the
board previews the result while the pointer is still down. Escape cancels and puts it back. layn never
mutates your array - you apply the move, which is also where you persist it:

```ts
onReorder: (from, to) => {
  setCards(move(cards, from, to));
  void saveOrder(move(cards, from, to));
};
```

Style the held card through `data-layn-dragging`:

```css
.card[data-layn-dragging] {
  cursor: grabbing;
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.35);
}
```

## Cards of a fixed height

Quilt's cells are square by construction. If your cards need a specific height instead, use `columns`
(round-robin, keeps reading order) or `masonry` with `height` on each item, and drop `span`.
