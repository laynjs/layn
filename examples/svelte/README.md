# @laynjs/svelte example

A live demo of the headless Svelte adapter, plus a Playwright e2e (client render + virtualization).

```bash
pnpm --filter @laynjs/example-svelte dev    # live demo on http://localhost:5192
pnpm build && pnpm --filter @laynjs/example-svelte e2e   # render + virtualization + scroll e2e
```

## Usage (Svelte 5 runes)

`useLayn` returns Svelte stores (`items`, `contentStyle`, `totalSize`) and two actions
(`container`, `item`). It works natively in a runes component: subscribe to the stores with `$items`
/ `$contentStyle`, hold your inputs in `$state`, and push them into the engine from `$effect` via
`setItems` / `setAlgorithm` / `setGap`. The `item` action positions and measures each tile, so a
single `use:item` directive is all a tile needs.

```svelte
<script lang="ts">
  import { masonry, type LayoutItem } from '@laynjs/core'
  import { useLayn } from '@laynjs/svelte'

  let { photos }: { photos: Photo[] } = $props()

  const toItems = (list: Photo[]): LayoutItem<Photo>[] =>
    list.map((p) => ({ id: p.id, aspectRatio: p.width / p.height, data: p }))

  const data = $derived(toItems(photos))

  const view = useLayn<Photo>({
    algorithm: masonry({ columnWidth: 240 }),
    items: data,
    gap: { x: 12, y: 12 },
    overscan: 300,
  })
  const { container, containerStyle, item, items, contentStyle, setItems } = view

  const css = (style: Record<string, string>): string =>
    Object.entries(style)
      .map(([key, value]) => `${key}:${value}`)
      .join(';')

  $effect(() => setItems(data))
</script>

<div use:container style="{css(containerStyle)};height:100vh">
  <div style={css($contentStyle)}>
    {#each $items as entry (entry.id)}
      <div use:item={{ id: entry.id, rect: entry.rect }}>
        <img src={entry.item.data.src} alt="" />
      </div>
    {/each}
  </div>
</div>
```

Legacy (non-runes) components work too: hold inputs in plain `let`s and sync with `$:` blocks
(`$: setItems(toItems(photos))`) instead of `$state` + `$effect`. The adapter surface is identical
either way.

Positions come from `aspectRatio` (data, not the DOM), so the layout is SSR-deterministic. The
adapter is SSR-safe: `onMount` (which creates the scroll binding) and the actions are client-only,
so a server render uses the eager engine snapshot.
