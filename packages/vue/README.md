# @laynjs/vue

The Vue 3 adapter for [layn](https://layn.io), the headless layout engine. SSR-safe, virtualized, and deterministic across hydration.

## Install

```bash
npm install @laynjs/vue @laynjs/core
```

Requires `vue` ^3.3 as a peer dependency.

## Usage

```vue
<script setup>
import { useLayn } from '@laynjs/vue'
import { masonry } from '@laynjs/core'

const { containerRef, containerStyle, containerAttrs, contentStyle, contentAttrs, items } = useLayn({
  items: data,
  algorithm: masonry({ columnWidth: 236 }),
  gap: { x: 12, y: 12 },
})
</script>

<template>
  <div ref="containerRef" :style="containerStyle" v-bind="containerAttrs">
    <div :style="contentStyle" v-bind="contentAttrs">
      <div v-for="entry in items" :key="entry.id" :ref="entry.ref" :style="entry.style" v-bind="entry.a11y" />
    </div>
  </div>
</template>
```

`algorithm`, `gap`, and `items` accept refs or getters and stay reactive. Only the visible items render.

## Documentation

Full guides and API reference: [docs.layn.io](https://docs.layn.io/adapters/vue)

## License

[MIT](https://github.com/laynjs/layn/blob/main/LICENSE)
