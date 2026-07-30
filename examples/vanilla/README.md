# @laynjs/vanilla example

A live demo of the framework-free adapter, plus a Playwright SSR-hydration e2e.

```bash
pnpm --filter @laynjs/example-vanilla dev    # live demo on http://localhost:5190
pnpm build && pnpm --filter @laynjs/example-vanilla e2e   # SSR adoption + virtualization e2e
```

## Usage

`createLayn` is an imperative controller: it creates, positions, virtualizes, and measures the item
nodes for you. Fill each node in `renderItem`.

```ts
import { masonry, type LayoutItem } from '@laynjs/core'
import { createLayn } from '@laynjs/vanilla'

const items: LayoutItem<Photo>[] = photos.map((p) => ({
  id: p.id,
  aspectRatio: p.width / p.height,
  data: p,
}))

const gallery = createLayn<Photo>(document.getElementById('gallery')!, {
  algorithm: masonry({ columnWidth: 240 }),
  items,
  gap: { x: 12, y: 12 },
  overscan: 300,
  renderItem: (element, item) => {
    const img = document.createElement('img')
    img.src = item.data.src
    element.append(img)
  },
})

// later
gallery.setAlgorithm(masonry({ columnWidth: 180 }))
gallery.setItems(nextItems)
gallery.destroy()
```

## SSR

On the server, `renderToString` emits the same markup (from the engine, no DOM) so the client can
adopt it instead of recreating nodes:

```ts
import { masonry } from '@laynjs/core'
import { renderToString } from '@laynjs/vanilla'

const html = renderToString({
  algorithm: masonry({ columnWidth: 240 }),
  items,
  gap: { x: 12, y: 12 },
  viewport: { width: 1200, height: 800 },
  renderItem: (item) => `<img src="${item.data.src}" alt="">`,
})
// put `html` inside your scroll container; on the client, createLayn(container, ...) adopts it.
```
