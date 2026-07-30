# @laynjs/vanilla

The framework-free adapter for [layn](https://layn.io), the headless layout engine. An imperative controller that creates, positions, virtualizes, and measures item nodes for you, with SSR `renderToString` and client-side node adoption (hydration).

## Install

```bash
npm install @laynjs/vanilla @laynjs/core
```

No framework peer dependency.

## Usage

```ts
import { createLayn } from '@laynjs/vanilla'
import { masonry } from '@laynjs/core'

const grid = document.getElementById('grid')

const layn = createLayn(grid, {
  items,
  algorithm: masonry({ columnWidth: 236 }),
  gap: { x: 12, y: 12 },
  renderItem: (element, item) => {
    element.textContent = String(item.id)
  },
})

// layn.setItems(next), layn.setAlgorithm(...), layn.setGap(...), layn.refresh(), layn.destroy()
```

For SSR, `renderToString(options)` emits the same markup on the server, and `createLayn` adopts those nodes on the client instead of recreating them.

## Documentation

Full guides and API reference: [docs.layn.io](https://docs.layn.io/adapters/vanilla)

## License

[MIT](https://github.com/laynjs/layn/blob/main/LICENSE)
