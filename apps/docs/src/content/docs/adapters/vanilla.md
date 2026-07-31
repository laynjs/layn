---
title: Vanilla
description: The @laynjs/vanilla framework-free createLayn controller and renderToString.
---

`@laynjs/vanilla` has no framework peer dependency. It is an imperative controller that manages the DOM
for you, plus a `renderToString` for server rendering and node adoption on the client.

## Install

```bash
npm install @laynjs/core @laynjs/vanilla
```

## Usage

```ts
import { masonry } from '@laynjs/core';
import { createLayn } from '@laynjs/vanilla';

const container = document.getElementById('gallery');

const layn = createLayn(container, {
  items: photos,
  algorithm: masonry({ columns: 4 }),
  gap: { x: 12, y: 12 },
  overscan: 200,
  label: 'Gallery',
  renderItem: (element, item) => {
    element.textContent = String(item.data);
  },
});
```

`createLayn` creates, positions, virtualizes, and measures the item nodes itself, using a keyed DOM
reconciler over the visible set. You only fill each node in `renderItem`.

:::caution
In `renderItem`, set individual style properties (`element.style.background = ...`), not
`element.style.cssText`. Overwriting `cssText` would wipe the position style the reconciler applies.
:::

## Controller methods

| Method | Description |
| --- | --- |
| `setItems(items)` | Replace the items. |
| `setAlgorithm(algorithm)` | Swap the algorithm. |
| `setGap(gap)` | Change spacing. |
| `scrollToItem(id, options?)` / `scrollToIndex(index, options?)` | Programmatic scrolling. See the [scrolling guide](/guides/scrolling/). |
| `refresh()` | Re-measure the container and recompute. |
| `destroy()` | Tear down observers and remove nodes. |

`createLayn` also accepts `animate` ([animations guide](/guides/animations/)) and `scroll: 'window'`
([scrolling guide](/guides/scrolling/)).

## Server rendering

`renderToString` emits the same markup on the server, with a string `renderItem`:

```ts
import { renderToString } from '@laynjs/vanilla';

const html = renderToString({
  items: photos,
  algorithm: masonry({ columns: 4 }),
  gap: { x: 12, y: 12 },
  viewport: { width: 960, height: 600 },
  renderItem: (item) => `<span>${item.data}</span>`,
});
```

On the client, `createLayn` **adopts** the existing server nodes (matched by their
`data-layn-content` and `data-layn-id` attributes) instead of recreating them, so hydration is seamless
and there is no flash.

## When to use it

Reach for the vanilla adapter for web components, non-framework pages, or when you want full control
over the item DOM without a framework runtime.
