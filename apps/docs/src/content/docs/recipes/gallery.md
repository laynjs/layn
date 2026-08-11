---
title: Photo gallery
description: A responsive masonry wall of images that keeps its aspect ratios, animates, and jumps to any photo.
---

The classic use case: a wall of photographs of every shape, packed tightly, that reflows as the
container changes and never jumps around while images load.

```tsx
import { masonry } from '@laynjs/core';
import { useLayn } from '@laynjs/react';

export function Gallery({ photos }) {
  const layn = useLayn({
    items: photos,
    algorithm: masonry({ columns: { 0: 1, 520: 2, 900: 3, 1240: 4 } }),
    gap: { x: 12, y: 12 },
    overscan: 400,
    animate: true,
    label: 'Photo gallery',
  });

  return (
    <div {...layn.containerProps} className="gallery">
      <div {...layn.contentProps}>
        {layn.items.map((entry) => (
          <div
            key={entry.id}
            ref={entry.ref}
            style={{ ...entry.style, borderRadius: 10, overflow: 'hidden' }}
            {...entry.a11y}
          >
            <img
              src={entry.item.data.src}
              alt={entry.item.data.alt}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

```css
.gallery {
  height: 100%;
}
```

## The three things that matter

**Give every photo an `aspectRatio`.** You almost always know it server-side from the image record, and
it is what makes the layout identical on the server and the client - no reflow when the images arrive,
no layout shift:

```ts
const photos = rows.map((row) => ({
  id: row.id,
  aspectRatio: row.width / row.height,
  data: { src: row.url, alt: row.caption },
}));
```

**Never put the ref on the `<img>`.** The wrapper `<div>` takes it. An image reports a collapsed box
before its file loads, and that near-zero height would reach the engine and fold the whole grid. This
is the single most common way to break a layn gallery - see [measurement](/core/measurement/).

**Let the columns follow the container.** The breakpoint map above is read against the element the
grid lives in, not the window, so the gallery behaves the same in a full-width page and in a narrow
side panel. See [responsive column counts](/core/algorithms/#responsive-column-counts).

## Jumping to a photo

A lightbox usually needs to bring the grid back to whatever the user was looking at:

```tsx
const openAt = (id) => {
  setLightbox(id);
};

const closeLightbox = (id) => {
  setLightbox(undefined);
  layn.scrollToItem(id, { align: 'center', behavior: 'smooth' });
};
```

`scrollToItem` works no matter how far off-screen the photo is, because the engine knows every
rectangle whether or not it is rendered.

## Grouping by date

Photo libraries are usually grouped. Wrap the algorithm and add header items:

```ts
algorithm: sections(masonry({ columns: { 0: 2, 900: 3, 1240: 4 } }), { isHeader }),
stickyHeaders: isHeader,
```

Each month's columns then start level rather than continuing from the previous month, and the month
label stays at the top while you scroll it. Full walkthrough in [sections](/guides/sections/).

## Right-to-left

Add `direction: 'rtl'` and the wall mirrors. Nothing else changes - the mirroring happens in the
engine, so scroll-to and hit-testing follow. See [right-to-left](/core/algorithms/#right-to-left).
