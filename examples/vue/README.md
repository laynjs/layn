# @laynjs/vue example

A live demo of the headless Vue 3 adapter, plus a Playwright SSR-hydration e2e.

```bash
pnpm --filter @laynjs/example-vue dev    # live demo on http://localhost:5189
pnpm build && pnpm --filter @laynjs/example-vue e2e   # SSR hydration + virtualization e2e
```

## Usage

`useLayn` is a composable. Reactive inputs (`items`, `algorithm`, `gap`) accept refs, getters, or
plain values; the returned `contentStyle` / `items` / `totalSize` are computed refs.

```vue
<script setup lang="ts">
import { masonry, type LayoutItem } from '@laynjs/core'
import { useLayn } from '@laynjs/vue'
import { computed } from 'vue'

const props = defineProps<{ photos: Photo[] }>()

const items = computed<LayoutItem<Photo>[]>(() =>
  props.photos.map((p) => ({ id: p.id, aspectRatio: p.width / p.height, data: p })),
)

const { containerRef, containerStyle, contentStyle, items: visible } = useLayn({
  algorithm: masonry({ columnWidth: 240 }),
  items,
  gap: { x: 12, y: 12 },
  overscan: 300,
})
</script>

<template>
  <div :ref="containerRef" :style="{ ...containerStyle, height: '100vh' }">
    <div :style="contentStyle">
      <div v-for="entry in visible" :key="entry.id" :ref="entry.ref" :style="entry.style">
        <img :src="entry.item.data.src" alt="" />
      </div>
    </div>
  </div>
</template>
```

Positions come from `aspectRatio` (data, not the DOM), so `@vue/server-renderer` and the client render
identical rects and hydration has no layout shift. Swap `algorithm` for `justified(...)`,
`columns(...)`, `packing(...)`, etc.
