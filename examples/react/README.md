# @laynjs/react example

A live demo of the headless React adapter, plus a Playwright SSR-hydration e2e.

```bash
pnpm --filter @laynjs/example-react dev    # live demo on http://localhost:5188
pnpm build && pnpm --filter @laynjs/example-react e2e   # SSR hydration + virtualization e2e
```

## Usage

`useLayn` is headless: it computes positions and hands you props + a virtualized item list.
You render the DOM.

```tsx
import { masonry, type LayoutItem } from '@laynjs/core'
import { useLayn } from '@laynjs/react'

function Gallery({ photos }: { photos: Photo[] }) {
  const items: LayoutItem<Photo>[] = photos.map((p) => ({
    id: p.id,
    aspectRatio: p.width / p.height,
    data: p,
  }))

  const { containerProps, contentProps, items: visible } = useLayn({
    algorithm: masonry({ columnWidth: 240 }),
    items,
    gap: { x: 12, y: 12 },
    overscan: 300,
  })

  return (
    <div {...containerProps} style={{ ...containerProps.style, height: '100vh' }}>
      <div {...contentProps}>
        {visible.map((entry) => (
          <div key={entry.id} ref={entry.ref} style={entry.style}>
            <img src={entry.item.data.src} alt="" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

`containerProps.ref` wires up scroll + resize measurement; each `entry.ref` measures that item.
Because positions are computed from `aspectRatio` (data, not the DOM), the server and client render
identical rects, so SSR hydrates with no layout shift. Swap `algorithm` for `justified(...)`,
`columns(...)`, `packing(...)`, etc.
