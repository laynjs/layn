---
title: React
description: The @laynjs/react headless useLayn hook.
---

`@laynjs/react` is a headless hook built on `useSyncExternalStore`. It is SSR-safe: the engine is
created eagerly so the first server render is fully positioned.

## Install

```bash
npm install @laynjs/core @laynjs/react
```

Peer dependency: React 18 or 19.

## Usage

```tsx
import { masonry } from '@laynjs/core';
import { useLayn } from '@laynjs/react';

function Gallery({ photos }) {
  const layn = useLayn({
    items: photos,
    algorithm: masonry({ columns: 4 }),
    gap: { x: 12, y: 12 },
    overscan: 200,
    label: 'Gallery',
  });

  return (
    <div {...layn.containerProps} className="gallery">
      <div {...layn.contentProps}>
        {layn.items.map((entry) => (
          <div key={entry.id} ref={entry.ref} style={entry.style} {...entry.a11y}>
            {entry.item.data}
          </div>
        ))}
      </div>
    </div>
  );
}
```

Give the container a fixed height in your CSS (`.gallery { height: 600px; }`). `containerProps` already
sets `position: relative` and `overflow: auto`, so the height is all you add.

## What the hook returns

| Field | Description |
| --- | --- |
| `containerProps` | Spread onto the scroll element: `ref`, `style`, `tabIndex`, and the region role/label. |
| `contentProps` | Spread onto the inner sizing element: `style` and `role="list"`. |
| `items` | The visible view-models: `{ id, index, item, style, a11y, ref }`. |
| `totalSize` | `{ width, height }` of the whole grid. |
| `engine` | The raw engine, for advanced use. |
| `scrollToItem` / `scrollToIndex` | Programmatic scrolling with `align` and `behavior`. See the [scrolling guide](/guides/scrolling/). |

The hook also accepts `animate` ([animations guide](/guides/animations/)) and `scroll: 'window'`
([scrolling guide](/guides/scrolling/)).

For infinite scroll, pass `onReachEnd` - see the [infinite scroll guide](/guides/infinite-scroll/).

For drag-to-reorder, pass `onReorder` and call `startDrag(id, event)` - see the [drag and drop guide](/guides/drag-and-drop/).

## Item view-model

Each entry in `layn.items` is:

| Field | Description |
| --- | --- |
| `id` | The item id. |
| `index` | The item index in source order. |
| `item` | Your original `LayoutItem`, including `data`. |
| `style` | Absolute-position `CSSProperties`. Spread onto the element. |
| `a11y` | `role="listitem"`, `aria-setsize`, `aria-posinset`. Spread onto the element. |
| `ref` | A callback ref that measures the element and feeds the engine. |

## Reactivity

Pass new values and the hook syncs them into the engine. Memoizing the algorithm is recommended but
not required: an equivalent algorithm produces identical positions and does not re-render.

```tsx
const layn = useLayn({
  items,
  algorithm: useMemo(() => masonry({ columns }), [columns]),
  gap: { x: gap, y: gap },
});
```

## Server-side rendering

The hook renders correct positions on the server with no extra setup. `getServerSnapshot` supplies the
data-driven layout, so `renderToString` output matches the client and hydrates cleanly. See the
[SSR guide](/guides/ssr/).

## Preact

`@laynjs/react` works in Preact through `preact/compat`, with no separate adapter and no changes to
your code. With Vite, `@preact/preset-vite` already sets the aliases up:

```ts
import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [preact()] });
```

```tsx
import { masonry } from '@laynjs/core';
import { useLayn } from '@laynjs/react';
import { render } from 'preact';

function Grid({ items }) {
  const layn = useLayn({ items, algorithm: masonry({ columns: 4 }), gap: { x: 8, y: 8 } });
  // identical to the React usage above
}
```

Verified against Preact 10 with virtualization, measurement, animation and the accessibility
attributes all behaving as they do in React. Without a bundler alias, configure `react` and
`react-dom` to resolve to `preact/compat` however your toolchain does it.
