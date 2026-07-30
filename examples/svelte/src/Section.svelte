<script lang="ts">
  import { untrack } from 'svelte'
  import { useLayn } from '@laynjs/svelte'
  import { hue, items as data, type LayoutSpec } from './layouts'

  let { spec }: { spec: LayoutSpec } = $props()

  const { container, containerStyle, containerAttrs, contentAttrs, item, items, contentStyle } =
    untrack(() =>
      useLayn<number>({
        algorithm: spec.algorithm,
        items: data,
        gap: { x: 8, y: 8 },
        viewport: { width: 880, height: 340 },
        axis: spec.axis,
        overscan: 200,
        label: spec.label,
      }),
    )

  const css = (style: Record<string, string>): string =>
    Object.entries(style)
      .map(([key, value]) => `${key}:${value}`)
      .join(';')
</script>

<section style="margin-bottom:28px">
  <div
    use:container
    {...containerAttrs}
    style="{css(
      containerStyle,
    )};height:340px;border:1px solid #e5e5e5;border-radius:10px;background:#fafafa"
  >
    <div {...contentAttrs} style={css($contentStyle)}>
      {#each $items as entry (entry.id)}
        <div
          use:item={{ id: entry.id, rect: entry.rect }}
          {...entry.a11y}
          style="background:hsl({hue(
            entry.index,
          )} 68% 66%);border-radius:6px;display:flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.5);font-size:12px;font-weight:600"
        >
          {entry.index}
        </div>
      {/each}
    </div>
  </div>
</section>
