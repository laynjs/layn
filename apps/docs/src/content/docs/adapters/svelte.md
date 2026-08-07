---
title: Svelte
description: The @laynjs/svelte headless useLayn stores and actions, runes-native.
---

`@laynjs/svelte` returns Svelte stores plus two `use:` actions. It is fully compatible with Svelte 5
runes and with the legacy reactive syntax. The library itself is plain TypeScript, so it needs no
Svelte compiler to typecheck.

## Install

```bash
npm install @laynjs/core @laynjs/svelte
```

Peer dependency: Svelte 5.

## Usage (runes)

```svelte
<script lang="ts">
  import { untrack } from 'svelte';
  import { masonry } from '@laynjs/core';
  import { useLayn } from '@laynjs/svelte';

  let { photos }: { photos: Photo[] } = $props();

  const { container, containerStyle, containerAttrs, contentAttrs, item, items, contentStyle, setItems } =
    untrack(() =>
      useLayn<string>({
        items: photos,
        algorithm: masonry({ columns: 4 }),
        gap: { x: 12, y: 12 },
        overscan: 200,
        label: 'Gallery',
      }),
    );

  $effect(() => setItems(photos));

  const css = (style: Record<string, string>) =>
    Object.entries(style).map(([k, v]) => `${k}:${v}`).join(';');
</script>

<div use:container {...containerAttrs} style="{css(containerStyle)};height:600px">
  <div {...contentAttrs} style={css($contentStyle)}>
    {#each $items as entry (entry.id)}
      <div use:item={{ id: entry.id, rect: entry.rect }} {...entry.a11y} style={css(entry.style)}>
        {entry.item.data}
      </div>
    {/each}
  </div>
</div>
```

## What it returns

| Field | Description |
| --- | --- |
| `container` | A `use:` action for the scroll element (binds on mount). |
| `containerStyle` | Static style object. |
| `containerAttrs` / `contentAttrs` | Accessibility attributes to spread. |
| `item` | A `use:` action for each item (applies position before observing size). |
| `items` | A readable store of visible view-models. |
| `contentStyle` | A readable store with the content size. |
| `totalSize` | A readable store, `{ width, height }`. |
| `engine` | The raw engine. |
| `setItems` / `setAlgorithm` / `setGap` | Imperative updates. |

The hook also accepts `animate` ([animations guide](/guides/animations/)) and `scroll: 'window'`
([scrolling guide](/guides/scrolling/)), and returns `scrollToItem(id, options?)` /
`scrollToIndex(index, options?)` for programmatic scrolling.

For infinite scroll, pass `onReachEnd` - see the [infinite scroll guide](/guides/infinite-scroll/).

## Why actions

The two `use:` actions solve the two lifecycle details for you: `use:container` binds after mount when
the element is laid out, and `use:item` applies the position style before it starts observing the
element's size. You never have to think about either.

## Legacy syntax

The stores and actions work identically with the legacy `$:` syntax if you are not on runes yet. Use
`$: setItems(photos)` in place of the `$effect` above.
