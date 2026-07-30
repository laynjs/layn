# @laynjs/react

The React adapter for [layn](https://layn.io), the headless layout engine. SSR-safe, virtualized, and deterministic across hydration.

## Install

```bash
npm install @laynjs/react @laynjs/core
```

Requires `react` 18 or 19 as a peer dependency.

## Usage

```tsx
import { useLayn } from '@laynjs/react'
import { masonry } from '@laynjs/core'

export function Gallery({ items }) {
  const layn = useLayn({
    items,
    algorithm: masonry({ columnWidth: 236 }),
    gap: { x: 12, y: 12 },
  })

  return (
    <div {...layn.containerProps}>
      <div {...layn.contentProps}>
        {layn.items.map((entry) => (
          <div key={entry.id} ref={entry.ref} style={entry.style} {...entry.a11y}>
            {/* your item content */}
          </div>
        ))}
      </div>
    </div>
  )
}
```

Only the visible items are rendered. `useLayn` also accepts `axis`, `overscan`, and `label`, and returns `totalSize` and the underlying `engine`.

## Documentation

Full guides and API reference: [docs.layn.io](https://docs.layn.io/adapters/react)

## License

[MIT](https://github.com/laynjs/layn/blob/main/LICENSE)
