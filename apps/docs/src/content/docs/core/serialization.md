---
title: Serialization & hydration
description: Embed a layn layout in SSR HTML and reproduce it on the client by determinism, not by trusting geometry.
---

layn is built for server-side rendering. The server computes the full layout, sends positioned HTML,
and the client reproduces the identical layout on hydration. Serialization is how the small amount of
state that crosses the wire is packaged.

## Serialize on the server

```ts
import { createEngine, masonry } from '@laynjs/core';

const engine = createEngine({
  algorithm: masonry({ columns: 4 }),
  items,
  viewport: { width: 960, height: 600 },
});

const payload = engine.serialize();
// embed `payload` in your HTML, for example as JSON in a script tag
```

The payload is compact: it carries the items and configuration needed to reproduce the layout, not a
giant list of rectangles.

## Hydrate on the client

```ts
import { hydrateEngine, masonry } from '@laynjs/core';

const engine = hydrateEngine(payload, { algorithm: masonry({ columns: 4 }) });
```

`hydrateEngine` re-runs the algorithm from the serialized items and configuration. It reproduces the
layout by **determinism**, not by injecting the serialized rectangles. This matters for safety and
size: a serialized `count` can never drive an allocation, because the geometry is recomputed rather
than trusted.

## Guards

Hydration validates that the client and server agree:

- **Version guard** - a payload from an incompatible engine version is rejected.
- **Algorithm-name guard** - hydrating with a different algorithm than was serialized is rejected.
- **Optional `verify`** - pass `verify: true` to recompute and compare rectangles against the
  serialized ones, catching option mismatches (a different gap or column count) explicitly.

```ts
const engine = hydrateEngine(payload, { algorithm: masonry({ columns: 4 }), verify: true });
```

All guard failures throw a `LaynError` with a typed `code`, so you can branch on the exact problem.

## Why there is no layout shift

The server sends HTML where every item already sits at its final position. The client recomputes the
same positions before the browser paints anything new, so the markup matches and nothing moves. Images
loading later do not shift the grid, because their boxes were sized from data up front.

See the [SSR and hydration guide](/guides/ssr/) for framework-specific wiring, and the
[React](/adapters/react/) and [Vue](/adapters/vue/) adapters for working SSR examples.
