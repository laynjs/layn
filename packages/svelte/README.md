# @laynjs/svelte

The Svelte 5 adapter for [layn](https://layn.io), the headless layout engine. Fully runes-compatible for consumers, virtualized, and deterministic across hydration.

## Install

```bash
npm install @laynjs/svelte @laynjs/core
```

Requires `svelte` ^5 as a peer dependency.

## Usage

```svelte
<script>
  import { useLayn } from '@laynjs/svelte'
  import { masonry } from '@laynjs/core'

  const css = (style) => Object.entries(style).map(([k, v]) => `${k}:${v}`).join(';')

  const { container, containerStyle, containerAttrs, item, items, contentStyle, contentAttrs } = useLayn({
    items: data,
    algorithm: masonry({ columnWidth: 236 }),
    gap: { x: 12, y: 12 },
  })
</script>

<div use:container {...containerAttrs} style={css(containerStyle)}>
  <div {...contentAttrs} style={css($contentStyle)}>
    {#each $items as entry (entry.id)}
      <div use:item={{ id: entry.id, rect: entry.rect }} {...entry.a11y}></div>
    {/each}
  </div>
</div>
```

`useLayn` returns Svelte stores plus the `container` and `item` actions, which handle mounting and measurement. Legacy `$:` syntax is also supported.

## Documentation

Full guides and API reference: [docs.layn.io](https://docs.layn.io/adapters/svelte)

## License

[MIT](https://github.com/laynjs/layn/blob/main/LICENSE)
