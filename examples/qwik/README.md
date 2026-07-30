# @laynjs/qwik example

A live demo of the headless Qwik adapter, plus a Playwright e2e (client render + virtualization).

```bash
pnpm --filter @laynjs/example-qwik dev    # live demo on http://localhost:5194
pnpm build && pnpm --filter @laynjs/example-qwik e2e   # render + virtualization + scroll e2e
```

## Usage

`useLayn` returns Qwik signals (`items`, `contentStyle`, `totalSize`), a `containerRef` signal you
bind to the scroll container, and imperative `setItems` / `setAlgorithm` / `setGap`. The engine is
created lazily inside a `useVisibleTask$` (client only), so the DOM binding happens after the
container is laid out. Drive reactive inputs from a `useTask$` that tracks your signals and calls the
setters.

```tsx
import { component$, useSignal, useTask$ } from '@builder.io/qwik'
import { masonry, type LayoutItem } from '@laynjs/core'
import { useLayn } from '@laynjs/qwik'

export const Gallery = component$<{ photos: Photo[] }>(({ photos }) => {
  const cols = useSignal(4)
  const toItems = (list: Photo[]): LayoutItem<Photo>[] =>
    list.map((p) => ({ id: p.id, aspectRatio: p.width / p.height, data: p }))

  const view = useLayn<Photo>({
    algorithm: masonry({ columns: cols.value }),
    items: toItems(photos),
    gap: { x: 12, y: 12 },
    overscan: 300,
  })

  useTask$(({ track }) => {
    const columns = track(() => cols.value)
    view.setAlgorithm(masonry({ columns }))
  })

  return (
    <div ref={view.containerRef} style={{ ...view.containerStyle, height: '100vh' }}>
      <div style={view.contentStyle.value}>
        {view.items.value.map((entry) => (
          <div key={entry.id} style={entry.style}>
            <img src={entry.item.data.src} alt="" />
          </div>
        ))}
      </div>
    </div>
  )
})
```

Positions come from `aspectRatio` (data, not the DOM), so the layout is SSR-deterministic. Sizing
uses `aspectRatio` or provided `width`/`height` rather than a per-item `ResizeObserver` (measurement
refs conflict with Qwik resumability), so provide an `aspectRatio` for content-variable tiles.

This example renders client-side (`render()` from `@builder.io/qwik`), which proves the layout and
virtualized scroll. Qwik wires DOM event handlers through its resumability system, so interactive
controls (and the `setAlgorithm` / `setItems` / `setGap` reactivity above) come alive in a full Qwik
SSR app; that is why the client-render demo shows a static virtualized layout.
