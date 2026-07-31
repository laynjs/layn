---
title: Qwik
description: The @laynjs/qwik headless useLayn resumable hook.
---

`@laynjs/qwik` is a resumable hook. The engine, store, and binding are non-serializable, so they are
held in `noSerialize` signals and the binding is created in a single client visible task.

## Install

```bash
npm install @laynjs/core @laynjs/qwik
```

Peer dependency: Qwik 1.5 or later.

## Usage

```tsx
import { component$ } from '@builder.io/qwik';
import { masonry } from '@laynjs/core';
import { useLayn } from '@laynjs/qwik';

export const Gallery = component$<{ photos: Photo[] }>(({ photos }) => {
  const layn = useLayn<string>({
    items: photos,
    algorithm: masonry({ columns: 4 }),
    gap: { x: 12, y: 12 },
    overscan: 200,
    label: 'Gallery',
  });

  return (
    <div ref={layn.containerRef} {...layn.containerAttrs} style={{ ...layn.containerStyle, height: '600px' }}>
      <div {...layn.contentAttrs} style={layn.contentStyle.value}>
        {layn.items.value.map((entry) => (
          <div key={entry.id} {...entry.a11y} style={entry.style}>
            {entry.item.data}
          </div>
        ))}
      </div>
    </div>
  );
});
```

## What it returns

| Field | Description |
| --- | --- |
| `containerRef` | A signal ref for the scroll element. |
| `containerStyle` | Static style object. |
| `containerAttrs` / `contentAttrs` | Accessibility attributes to spread. |
| `items` | A signal of visible view-models. |
| `contentStyle` | A signal with the content-size style. |
| `totalSize` | A signal, `{ width, height }`. |
| `setItems` / `setAlgorithm` / `setGap` | Imperative updates. |
| `scrollToItem` / `scrollToIndex` | Programmatic scrolling. See the [scrolling guide](/guides/scrolling/). |

The hook also accepts `scroll: 'window'` ([scrolling guide](/guides/scrolling/)). The `animate` option is
not available in Qwik: resumable rendering has no per-item element refs for the transition layer.

## Reactivity is consumer-driven

Call the setters from a `useTask$` that tracks your own signals. Qwik task reactivity re-runs
reliably only in optimizer-processed code, which your app is:

```tsx
useTask$(({ track }) => {
  const cols = track(() => columns.value);
  layn.setAlgorithm(masonry({ columns: cols }));
});
```

## Sizing

To stay compatible with resumability, the Qwik adapter sizes items from `aspectRatio` or provided
dimensions rather than per-item measurement. Give every item an `aspectRatio` for correct layout.
