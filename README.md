<div align="center">

# layn

**The headless layout engine for the web.**

Compute your layout once, render it anywhere. Deterministic on the server, virtualized on the client, rendered by any framework.

[![npm](https://img.shields.io/npm/v/@laynjs/core.svg)](https://www.npmjs.com/package/@laynjs/core)
[![CI](https://github.com/laynjs/layn/actions/workflows/ci.yml/badge.svg)](https://github.com/laynjs/layn/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

[Documentation](https://docs.layn.io) · [Playground](https://play.layn.io) · [Website](https://layn.io)

</div>

## What is layn?

layn is a framework-agnostic layout engine that replaces stagnant libraries like `masonic`. The core is a pure function of state - `(items + config + measurements) -> positions + contentSize` - with no DOM and no framework inside. The server and the client compute identical rectangles from the same data, so hydration never mismatches and there is no layout shift.

- **Headless** - the engine computes positions; your framework renders.
- **SSR-deterministic** - data-first measurement (aspect ratio / provided dimensions) so the server and client agree, refined by `ResizeObserver` after paint.
- **First-class virtualization** - only the visible items are in the DOM, as a separate layer from layout.
- **Nine layouts** - masonry, columns, justified, staggered, packing, bin-packing, quilt, magazine, and horizontal masonry.
- **Every major framework** - thin adapters for React, Vue, Svelte, Solid, Angular, Qwik, and vanilla.
- **Zero-dependency core** - `@laynjs/core` has no runtime dependencies and is DOM-free.

## Install

```bash
npm install @laynjs/core @laynjs/react
```

Every package is standard ESM, so it also works straight from a CDN with no build step:

```html
<script type="module">
  import { createEngine, masonry } from 'https://esm.sh/@laynjs/core'
</script>
```

## Quick start (React)

```tsx
import { useLayn } from '@laynjs/react'
import { masonry } from '@laynjs/core'

export function Gallery({ items }) {
  const layn = useLayn({ items, algorithm: masonry({ columnWidth: 236 }), gap: { x: 12, y: 12 } })

  return (
    <div {...layn.containerProps}>
      <div {...layn.contentProps}>
        {layn.items.map((entry) => (
          <div key={entry.id} ref={entry.ref} style={entry.style} {...entry.a11y}>
            {/* your item */}
          </div>
        ))}
      </div>
    </div>
  )
}
```

See the [documentation](https://docs.layn.io) for every framework and every algorithm.

## Packages

| Package | Description |
| --- | --- |
| [`@laynjs/core`](./packages/core) | Framework-free, DOM-free positioning engine and algorithms. Zero runtime dependencies. |
| [`@laynjs/dom`](./packages/dom) | Browser measurement (`ResizeObserver`), scroll tracking, virtualization glue. |
| [`@laynjs/react`](./packages/react) | React adapter. |
| [`@laynjs/vue`](./packages/vue) | Vue 3 adapter. |
| [`@laynjs/svelte`](./packages/svelte) | Svelte 5 adapter. |
| [`@laynjs/solid`](./packages/solid) | Solid adapter. |
| [`@laynjs/angular`](./packages/angular) | Angular adapter. |
| [`@laynjs/qwik`](./packages/qwik) | Qwik adapter. |
| [`@laynjs/vanilla`](./packages/vanilla) | Framework-free imperative controller. |
| [`@laynjs/adapter-utils`](./packages/adapter-utils) | Shared, framework-free adapter glue. |

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the development workflow, and please read our [Code of Conduct](./CODE_OF_CONDUCT.md).

```bash
pnpm install
pnpm check       # lint + format
pnpm typecheck
pnpm test
pnpm build
```

## License

[MIT](./LICENSE) © the layn authors
