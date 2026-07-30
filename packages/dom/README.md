# @laynjs/dom

Browser glue for [layn](https://layn.io): `ResizeObserver`-based viewport and item measurement, rAF-throttled scroll tracking, and the virtualization binding that connects a `@laynjs/core` engine to a real scroll container. All browser primitives are injectable, so it is fully testable without a DOM.

Most applications use a framework adapter (`@laynjs/react`, `@laynjs/vue`, ...) which wraps this package. Use `@laynjs/dom` directly only when building a custom integration.

## Install

```bash
npm install @laynjs/dom @laynjs/core
```

## Usage

```ts
import { createEngine, masonry } from '@laynjs/core'
import { bindEngine } from '@laynjs/dom'

const engine = createEngine({ algorithm: masonry({ columnWidth: 236 }), items })

const binding = bindEngine({ engine, container: document.getElementById('grid') })
// binding wires viewport (ResizeObserver), scroll (getVisible), and item measurement.
// binding.destroy() to tear down.
```

## Documentation

Full guides and API reference: [docs.layn.io](https://docs.layn.io)

## License

[MIT](https://github.com/laynjs/layn/blob/main/LICENSE)
