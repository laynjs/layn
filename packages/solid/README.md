# @laynjs/solid

The Solid adapter for [layn](https://layn.io), the headless layout engine. Signal-based, virtualized, and deterministic across hydration.

## Install

```bash
npm install @laynjs/solid @laynjs/core
```

Requires `solid-js` ^1.8 as a peer dependency.

## Usage

```tsx
import { useLayn } from '@laynjs/solid'
import { masonry } from '@laynjs/core'
import { For } from 'solid-js'

export function Gallery() {
  const layn = useLayn({
    items,
    algorithm: masonry({ columnWidth: 236 }),
    gap: { x: 12, y: 12 },
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
}
```

`items()` returns stable references while a tile is unchanged, so `<For>` reuses DOM across virtualization. `algorithm`, `gap`, and `items` accept accessors or plain values.

## Documentation

Full guides and API reference: [docs.layn.io](https://docs.layn.io/adapters/solid)

## License

[MIT](https://github.com/laynjs/layn/blob/main/LICENSE)
