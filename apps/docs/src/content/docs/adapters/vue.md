---
title: Vue
description: The @laynjs/vue headless useLayn composable.
---

`@laynjs/vue` is a headless composition-API composable. Reactive inputs are accepted as refs, getters,
or plain values, and it is proven SSR-safe with `@vue/server-renderer`.

## Install

```bash
npm install @laynjs/core @laynjs/vue
```

Peer dependency: Vue 3.3 or later.

## Usage

```vue
<script setup lang="ts">
import { masonry } from '@laynjs/core';
import { useLayn } from '@laynjs/vue';

const props = defineProps<{ photos: Photo[] }>();

const { containerRef, containerStyle, containerAttrs, contentAttrs, contentStyle, items } =
  useLayn<string>({
    items: () => props.photos,
    algorithm: masonry({ columns: 4 }),
    gap: { x: 12, y: 12 },
    overscan: 200,
    label: 'Gallery',
  });
</script>

<template>
  <div :ref="containerRef" v-bind="containerAttrs" :style="{ ...containerStyle, height: '600px' }">
    <div v-bind="contentAttrs" :style="contentStyle">
      <div
        v-for="entry in items"
        :key="entry.id"
        :ref="entry.ref"
        v-bind="entry.a11y"
        :style="entry.style"
      >
        {{ entry.item.data }}
      </div>
    </div>
  </div>
</template>
```

## What the composable returns

| Field | Description |
| --- | --- |
| `containerRef` | Function ref for the scroll element; attaches the binding on mount. |
| `containerStyle` | Static style object for the scroll element. |
| `containerAttrs` | `tabindex` and the region role/label. Bind with `v-bind`. |
| `contentAttrs` | `role="list"` for the content wrapper. |
| `contentStyle` | Computed ref with the total content size. |
| `items` | Computed ref of visible view-models. |
| `totalSize` | Computed ref, `{ width, height }`. |
| `engine` | The raw engine. |

The hook also accepts `animate` ([animations guide](/guides/animations/)) and `scroll: 'window'`
([scrolling guide](/guides/scrolling/)), and returns `scrollToItem(id, options?)` /
`scrollToIndex(index, options?)` for programmatic scrolling.

For infinite scroll, pass `onReachEnd` - see the [infinite scroll guide](/guides/infinite-scroll/).

For drag-to-reorder, pass `onReorder` and call `startDrag(id, event)` - see the [drag and drop guide](/guides/drag-and-drop/).

## Reactive inputs

`items`, `algorithm`, and `gap` accept a ref, a getter, or a plain value. Wrap anything reactive in a
getter (or a ref) so the composable tracks it:

```ts
useLayn({
  items: () => props.photos,
  algorithm: computed(() => (rows.value ? justified({ targetRowHeight: 200 }) : masonry({ columns: 4 }))),
  gap: { x: 12, y: 12 },
});
```

## Styles are strings

Vue does not auto-append units, so item and content styles are string-valued objects (for example
`width: '236px'`). Spread them straight onto `:style`.
