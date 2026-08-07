import type { AlgoSpec } from './layouts'

export interface SnippetContext {
  readonly spec: AlgoSpec
  readonly columns: number
  readonly size: number
  readonly gap: number
  readonly overscan: number
  readonly animate: boolean
  readonly infinite: boolean
}

export interface Framework {
  readonly id: string
  readonly label: string
  readonly lang: string
  readonly build: (ctx: SnippetContext) => string
}

const options = (
  { spec, columns, size, gap, overscan, animate, infinite }: SnippetContext,
  indent: string,
  reachEnd = 'loadMore',
): string => {
  const lines = [
    `${indent}items,`,
    `${indent}algorithm: ${spec.code({ columns, size })},`,
    `${indent}gap: { x: ${gap}, y: ${gap} },`,
  ]
  if (spec.axis === 'horizontal') {
    lines.push(`${indent}axis: 'horizontal',`)
  }
  lines.push(`${indent}overscan: ${overscan},`)
  if (animate) {
    lines.push(`${indent}animate: true,`)
  }
  if (infinite) {
    lines.push(`${indent}onReachEnd: ${reachEnd},`)
  }
  return lines.join('\n')
}

const core = (ctx: SnippetContext): string => `import { ${ctx.spec.codeName} } from '@laynjs/core'`

export const FRAMEWORKS: Framework[] = [
  {
    id: 'react',
    label: 'React',
    lang: 'tsx',
    build: (ctx) => `import { useLayn } from '@laynjs/react'
${core(ctx)}

export function Grid({ items }) {
  const layn = useLayn({
${options(ctx, '    ')}
  })

  return (
    <div {...layn.containerProps}>
      <div {...layn.contentProps}>
        {layn.items.map((entry) => (
          <div key={entry.id} ref={entry.ref} style={entry.style} {...entry.a11y} />
        ))}
      </div>
    </div>
  )
}`,
  },
  {
    id: 'vue',
    label: 'Vue',
    lang: 'vue',
    build: (ctx) => `<script setup>
import { useLayn } from '@laynjs/vue'
${core(ctx)}

const { containerRef, containerStyle, containerAttrs, contentStyle, contentAttrs, items } = useLayn({
${options(ctx, '  ')}
})
</script>

<template>
  <div ref="containerRef" :style="containerStyle" v-bind="containerAttrs">
    <div :style="contentStyle" v-bind="contentAttrs">
      <div v-for="entry in items" :key="entry.id" :ref="entry.ref" :style="entry.style" v-bind="entry.a11y" />
    </div>
  </div>
</template>`,
  },
  {
    id: 'svelte',
    label: 'Svelte',
    lang: 'svelte',
    build: (ctx) => `<script>
  import { useLayn } from '@laynjs/svelte'
  ${core(ctx)}

  const { container, containerStyle, containerAttrs, item, items, contentStyle, contentAttrs } = useLayn({
${options(ctx, '    ')}
  })
</script>

<div use:container {...containerAttrs} style={css(containerStyle)}>
  <div {...contentAttrs} style={css($contentStyle)}>
    {#each $items as entry (entry.id)}
      <div use:item={{ id: entry.id, rect: entry.rect }} {...entry.a11y} />
    {/each}
  </div>
</div>`,
  },
  {
    id: 'solid',
    label: 'Solid',
    lang: 'tsx',
    build: (ctx) => `import { useLayn } from '@laynjs/solid'
import { For } from 'solid-js'
${core(ctx)}

export function Grid() {
  const layn = useLayn({
${options(ctx, '    ')}
  })

  return (
    <div ref={layn.containerRef} {...layn.containerAttrs} style={layn.containerStyle}>
      <div {...layn.contentAttrs} style={layn.contentStyle()}>
        <For each={layn.items()}>
          {(entry) => <div ref={entry.ref} style={entry.style} {...entry.a11y} />}
        </For>
      </div>
    </div>
  )
}`,
  },
  {
    id: 'angular',
    label: 'Angular',
    lang: 'ts',
    build: (ctx) => `import { Component } from '@angular/core'
import { LaynContainerDirective, LaynItemDirective, useLayn } from '@laynjs/angular'
${core(ctx)}

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [LaynContainerDirective, LaynItemDirective],
  template: \`
    <div [laynContainer]="layn" [style]="css(layn.containerStyle)">
      <div [style]="css(layn.contentStyle())">
        @for (tile of layn.items(); track tile.id) {
          <div [laynItem]="{ ref: layn, id: tile.id, rect: tile.rect }"></div>
        }
      </div>
    </div>
  \`,
})
export class GridComponent {
  protected readonly layn = useLayn({
${options(ctx, '    ')}
  })
}`,
  },
  {
    id: 'qwik',
    label: 'Qwik',
    lang: 'tsx',
    build: (ctx) => `import { component$ } from '@builder.io/qwik'
import { useLayn } from '@laynjs/qwik'
${core(ctx)}

export const Grid = component$(() => {
  const layn = useLayn({
${options({ ...ctx, animate: false }, '    ', '$(loadMore)')}
  })

  return (
    <div ref={layn.containerRef} {...layn.containerAttrs} style={layn.containerStyle}>
      <div {...layn.contentAttrs} style={layn.contentStyle.value}>
        {layn.items.value.map((entry) => (
          <div key={entry.id} style={entry.style} {...entry.a11y} />
        ))}
      </div>
    </div>
  )
})`,
  },
  {
    id: 'vanilla',
    label: 'Vanilla',
    lang: 'ts',
    build: (ctx) => `import { createLayn } from '@laynjs/vanilla'
${core(ctx)}

const grid = document.getElementById('grid')

createLayn(grid, {
${options(ctx, '  ')}
  renderItem: (element, item) => {
    element.textContent = String(item.id)
  },
})`,
  },
]
