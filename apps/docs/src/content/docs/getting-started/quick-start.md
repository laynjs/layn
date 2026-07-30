---
title: Quick start
description: Render a virtualized, SSR-safe masonry grid with layn in a few lines.
---

This guide builds a virtualized masonry grid with the React adapter. The same shape applies to every
framework; see the [adapter pages](/adapters/overview/) for the exact syntax of each.

## 1. Describe your items

An item needs an `id` and enough information to size it before the DOM exists. The simplest option is
an `aspectRatio` (width divided by height). You can also pass explicit `width`/`height`, or attach any
`data` you want to render.

```ts
import type { LayoutItem } from '@laynjs/core';

const items: LayoutItem<string>[] = photos.map((photo) => ({
  id: photo.id,
  aspectRatio: photo.width / photo.height,
  data: photo.url,
}));
```

## 2. Call the hook

`useLayn` creates the engine, binds it to a scroll container, and returns everything you need to
render. Choose an algorithm from `@laynjs/core` and pass your items.

```tsx
import { masonry } from '@laynjs/core';
import { useLayn } from '@laynjs/react';

function Gallery({ items }) {
  const layn = useLayn({
    items,
    algorithm: masonry({ columns: 4 }),
    gap: { x: 12, y: 12 },
    overscan: 200,
    label: 'Photo gallery',
  });

  return (
    <div {...layn.containerProps} className="gallery">
      <div {...layn.contentProps}>
        {layn.items.map((entry) => (
          <div key={entry.id} ref={entry.ref} style={entry.style} {...entry.a11y}>
            <img src={entry.item.data} alt="" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

:::tip
Attach `entry.ref` to a plain wrapping element (a `<div>`), not directly to an `<img>` or other
replaced element. Replaced elements can report a collapsed size to the measurement observer before
their resource loads, which would feed a wrong height back into the engine. The wrapper is always
sized by `entry.style`, so measurement stays correct.
:::

The scroll viewport needs a fixed size, which you give it in your own CSS. `containerProps` already
sets `position` and `overflow`, so you only add the height:

```css
.gallery {
  height: 600px;
}
```

That is a complete, virtualized, accessible masonry grid.

## What each piece does

- **`containerProps`** spread onto your scroll container. They set `position: relative`,
  `overflow: auto`, a `tabindex` for keyboard scrolling, and the accessibility role.
- **`contentProps`** spread onto the inner sizing element. They set the total content size so the
  scrollbar is correct even though only a handful of items are rendered.
- **`layn.items`** is only the currently visible slice. Each entry carries a `style` (absolute
  position), a `ref` (feeds real measured sizes back to the engine), and `a11y` attributes.

## Change the layout at runtime

Every option is reactive. Swap the algorithm, the gap, or the item list and the engine recomputes:

```tsx
const layn = useLayn({
  items,
  algorithm: view === 'rows' ? justified({ targetRowHeight: 200 }) : masonry({ columns: 4 }),
  gap: { x: 12, y: 12 },
});
```

## Next

- Learn the [core concepts](/getting-started/concepts/): the engine, measurement, and virtualization.
- Browse the [nine algorithms](/core/algorithms/) and their options.
- Read your framework's [adapter page](/adapters/overview/) for the exact API.
