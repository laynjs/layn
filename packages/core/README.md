# @laynjs/core

The framework-free, DOM-free positioning engine at the heart of [layn](https://layn.io). Zero runtime dependencies. Computes SSR-deterministic positions for masonry, columns, justified, staggered, packing, bin-packing, quilt, magazine, and horizontal-masonry layouts.

## Install

```bash
npm install @laynjs/core
```

Also available from a CDN with no build step:

```html
<script type="module">
  import { createEngine, masonry } from 'https://esm.sh/@laynjs/core'
</script>
```

## Usage

```ts
import { createEngine, masonry } from '@laynjs/core'

const engine = createEngine({
  algorithm: masonry({ columnWidth: 236 }),
  gap: { x: 12, y: 12 },
  viewport: { width: 1200, height: 800 },
  items,
})

const snapshot = engine.getSnapshot()
const rect = snapshot.positions.rectAt(0) // { x, y, width, height }
```

The engine is a pure function of state - `(items + config + measurements) -> positions + contentSize` - so the server and the client compute identical rectangles. Use a framework adapter (`@laynjs/react`, `@laynjs/vue`, ...) to render.

## Documentation

Full guides and API reference: [docs.layn.io](https://docs.layn.io)

## License

[MIT](https://github.com/laynjs/layn/blob/main/LICENSE)
