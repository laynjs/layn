---
title: Solid
description: The @laynjs/solid headless useLayn signals primitive.
---

`@laynjs/solid` is a signals primitive. Its `items()` accessor returns stable object references while a
tile is unchanged, so `<For>` reuses DOM across virtualization.

## Install

```bash
npm install @laynjs/core @laynjs/solid
```

Peer dependency: Solid 1.8 or later.

## Usage

```tsx
import { For } from 'solid-js';
import { masonry } from '@laynjs/core';
import { useLayn } from '@laynjs/solid';

function Gallery(props: { photos: Photo[] }) {
  const layn = useLayn<string>({
    items: () => props.photos,
    algorithm: masonry({ columns: 4 }),
    gap: { x: 12, y: 12 },
    overscan: 200,
    label: 'Gallery',
  });

  return (
    <div
      ref={layn.containerRef}
      {...layn.containerAttrs}
      style={{ ...layn.containerStyle, height: '600px' }}
    >
      <div {...layn.contentAttrs} style={layn.contentStyle()}>
        <For each={layn.items()}>
          {(entry) => (
            <div ref={entry.ref} {...entry.a11y} style={entry.style}>
              {entry.item.data}
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
```

## What it returns

| Field | Description |
| --- | --- |
| `containerRef` | Ref for the scroll element; the binding attaches on mount. |
| `containerStyle` | Static style object. |
| `containerAttrs` / `contentAttrs` | Accessibility attributes to spread. |
| `contentStyle` | Accessor returning the content-size style. |
| `items` | Accessor returning the visible view-models (stable references). |
| `totalSize` | Accessor, `{ width, height }`. |
| `engine` | The raw engine. |

The hook also accepts `animate` ([animations guide](/guides/animations/)) and `scroll: 'window'`
([scrolling guide](/guides/scrolling/)), and returns `scrollToItem(id, options?)` /
`scrollToIndex(index, options?)` for programmatic scrolling.

For infinite scroll, pass `onReachEnd` - see the [infinite scroll guide](/guides/infinite-scroll/).

## Reactive inputs

`items`, `algorithm`, and `gap` accept an accessor or a plain value. Pass a getter for anything
reactive, as with `items: () => props.photos` above.

## Stable references and `<For>`

`items()` caches each view-model by id and position, so an unchanged tile returns the same object
across scroll updates. That lets Solid's `<For>` keep the existing DOM node instead of recreating it,
which keeps scrolling smooth.
