---
title: Infinite scroll
description: Load the next page of items when the scroll reaches the end of the content.
---

Pass `onReachEnd` and layn calls it whenever the scroll position gets close to the end of the
content. Append the next page to your items and the grid keeps growing.

```tsx
const [items, setItems] = useState(firstPage)

const layn = useLayn({
  items,
  algorithm: masonry({ columns: 4 }),
  animate: true,
  onReachEnd: async () => {
    const next = await fetchPage(items.length)
    setItems((current) => [...current, ...next])
  },
})
```

The option is available in every adapter. With `animate: true` the appended items fade in, so a feed
grows without a jolt.

## When it fires

The callback fires when the visible window reaches within `reachEndThreshold` pixels of the end of
the content. The default threshold is `200`, so loading starts just before the user hits the bottom.

```tsx
onReachEnd: loadMore,
reachEndThreshold: 600,
```

It also fires on a **horizontal** layout (`axis: 'horizontal'`), where "the end" is the right edge,
and in **window scroll** mode (`scroll: 'window'`).

## It fires once per page

The callback is latched against the content size: after it fires, it will not fire again until the
content actually grows. That means a slow or failed fetch never produces a burst of duplicate
requests, and reaching the end of your data (nothing more to append) simply stops the loop - no
guard flag needed on your side.

Once new items extend the content, the callback is armed again for the next end.

The callback is always invoked on the next animation frame, never synchronously inside a layout
commit, so appending from inside it can never recurse.

## Filling the first screen

If the initial page is shorter than the viewport there is nothing to scroll, so layn calls
`onReachEnd` right away. Keep appending and it keeps calling until the content is taller than the
container - the usual "first page was too small" case fixes itself.

## Qwik

Qwik takes a `QRL` so the callback survives resumability:

```tsx
import { $ } from '@builder.io/qwik';

const layn = useLayn({
  items: items.value,
  algorithm: masonry({ columns: 4 }),
  onReachEnd: $(() => {
    items.value = [...items.value, ...nextPage()];
  }),
});
```

## Vanilla

The controller takes the same options, and you append with `setItems`:

```ts
const layn = createLayn(container, {
  items,
  algorithm: masonry({ columns: 4 }),
  onReachEnd: () => {
    items = [...items, ...nextPage()];
    layn.setItems(items);
  },
});
```
