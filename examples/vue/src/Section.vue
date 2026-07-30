<script setup lang="ts">
import { useLayn } from '@laynjs/vue'
import { hue, items as data, type LayoutSpec } from './layouts'

const props = defineProps<{ spec: LayoutSpec }>()

const { containerRef, containerStyle, containerAttrs, contentAttrs, contentStyle, items } =
  useLayn<number>({
    algorithm: props.spec.algorithm,
    items: data,
    gap: { x: 8, y: 8 },
    viewport: { width: 880, height: 340 },
    axis: props.spec.axis,
    overscan: 200,
    label: props.spec.label,
  })
</script>

<template>
  <section style="margin-bottom: 28px">
    <div
      :ref="containerRef"
      v-bind="containerAttrs"
      :style="{
        ...containerStyle,
        height: '340px',
        border: '1px solid #e5e5e5',
        borderRadius: '10px',
        background: '#fafafa',
      }"
    >
      <div v-bind="contentAttrs" :style="contentStyle">
        <div
          v-for="entry in items"
          :key="entry.id"
          :ref="entry.ref"
          v-bind="entry.a11y"
          :style="{
            ...entry.style,
            background: `hsl(${hue(entry.index)} 68% 66%)`,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(0,0,0,0.5)',
            fontSize: '12px',
            fontWeight: '600',
          }"
        >
          {{ entry.index }}
        </div>
      </div>
    </div>
  </section>
</template>
