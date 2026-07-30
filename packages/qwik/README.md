# @laynjs/qwik

The Qwik adapter for [layn](https://layn.io), the headless layout engine. Resumable (signals held via `noSerialize`), virtualized, and deterministic across hydration.

## Install

```bash
npm install @laynjs/qwik @laynjs/core
```

Requires `@builder.io/qwik` ^1.5 as a peer dependency.

## Usage

```tsx
import { component$ } from '@builder.io/qwik'
import { useLayn } from '@laynjs/qwik'
import { masonry } from '@laynjs/core'

export const Gallery = component$(() => {
  const layn = useLayn({
    items,
    algorithm: masonry({ columnWidth: 236 }),
    gap: { x: 12, y: 12 },
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
})
```

Sizing uses aspect ratios and provided dimensions (no per-item measurement, to preserve resumability).

## Documentation

Full guides and API reference: [docs.layn.io](https://docs.layn.io/adapters/qwik)

## License

[MIT](https://github.com/laynjs/layn/blob/main/LICENSE)
