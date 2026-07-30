<svelte:options runes={true} />

<script lang="ts">
  import { masonry } from '@laynjs/core'
  import { useLayn } from '@laynjs/svelte'

  const data = Array.from({ length: 500 }, (_, index) => ({
    id: index,
    aspectRatio: 1,
    data: index,
  }))

  const view = useLayn<number>({
    algorithm: masonry({ columns: 3 }),
    items: data,
    gap: { x: 8, y: 8 },
    viewport: { width: 900, height: 600 },
    overscan: 200,
  })
  const { container, containerStyle, item, items, contentStyle } = view

  const css = (style: Record<string, string>): string =>
    Object.entries(style)
      .map(([key, value]) => `${key}:${value}`)
      .join(';')
</script>

<div use:container data-testid="container" style="{css(containerStyle)};width:900px;height:600px">
  <div data-testid="content" style={css($contentStyle)}>
    {#each $items as entry (entry.id)}
      <div
        use:item={{ id: entry.id, rect: entry.rect }}
        data-testid="item"
        data-id={String(entry.id)}
        style="background:#dddddd"
      >
        {entry.item.data}
      </div>
    {/each}
  </div>
</div>
