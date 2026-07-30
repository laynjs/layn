# @laynjs/solid example

A live demo of the headless Solid adapter, plus a Playwright e2e (client render + virtualization).

```bash
pnpm --filter @laynjs/example-solid dev    # live demo on http://localhost:5191
pnpm build && pnpm --filter @laynjs/example-solid e2e   # render + virtualization + scroll e2e
```

## Usage

`useLayn` is a signals primitive. Reactive inputs (`items`, `algorithm`, `gap`) accept accessors or
plain values; the returned `contentStyle` / `items` / `totalSize` are accessors. `items` returns stable
object references while a tile's position is unchanged, so `<For>` reuses DOM across virtualization.

```tsx
import { masonry, type LayoutItem } from '@laynjs/core'
import { useLayn } from '@laynjs/solid'
import { createMemo, For } from 'solid-js'

function Gallery(props: { photos: Photo[] }) {
  const items = createMemo<LayoutItem<Photo>[]>(() =>
    props.photos.map((p) => ({ id: p.id, aspectRatio: p.width / p.height, data: p })),
  )

  const view = useLayn<Photo>({
    algorithm: masonry({ columnWidth: 240 }),
    items,
    gap: { x: 12, y: 12 },
    overscan: 300,
  })

  return (
    <div ref={view.containerRef} style={{ ...view.containerStyle, height: '100vh' }}>
      <div style={view.contentStyle()}>
        <For each={view.items()}>
          {(entry) => (
            <div ref={entry.ref} style={entry.style}>
              <img src={entry.item.data.src} alt="" />
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
```

Positions come from `aspectRatio` (data, not the DOM), so the layout is SSR-deterministic. The adapter
is SSR-safe (effects and `onMount` are client-only; the first render uses the eager engine snapshot).
