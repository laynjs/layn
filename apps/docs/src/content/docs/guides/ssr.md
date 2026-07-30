---
title: SSR & hydration
description: Render layn on the server and hydrate on the client with no mismatch and no layout shift.
---

layn is designed for server-side rendering. Because layout is derived from data, the server produces
fully positioned HTML and the client reproduces the identical layout on hydration.

## Why it just works

The engine is created eagerly from your items and configuration, with no dependency on the DOM. On the
server that first synchronous render is already correct. On the client, the adapter creates the same
engine, recomputes the same positions, and only then attaches the browser bindings. The markup matches,
so there is no hydration warning and nothing moves.

## The one requirement

Give every item enough information to be sized without a DOM: an `aspectRatio`, or explicit
`width`/`height`. That is what lets the server lay out images before they load, which is what removes
cumulative layout shift.

```ts
const items = photos.map((p) => ({ id: p.id, aspectRatio: p.width / p.height, data: p.url }));
```

## React (Next.js, Remix, and friends)

The React hook supplies a server snapshot automatically. Render as usual:

```tsx
import { renderToString } from 'react-dom/server';

const html = renderToString(<Gallery photos={photos} />);
```

The output contains every item at its final position. On the client, hydrate the same component with
the same `photos` and it matches.

## Vue (Nuxt and friends)

Use `@vue/server-renderer` as normal. The composable renders correct positions server-side; hydrate
with `createSSRApp` on the client.

```ts
import { renderToString } from '@vue/server-renderer';

const html = await renderToString(createSSRApp(App));
```

## Vanilla

Use `renderToString` on the server and `createLayn` on the client. The controller adopts the existing
server nodes rather than recreating them. See the [vanilla adapter](/adapters/vanilla/).

## Using the engine directly

If you are not using an adapter, `serialize` and `hydrateEngine` carry the layout across the wire.
Hydration re-runs the algorithm rather than trusting serialized geometry, and validates version and
algorithm. See [serialization and hydration](/core/serialization/).

## Checklist

- Every item has an `aspectRatio` or explicit dimensions.
- The same items and algorithm are used on the server and the client.
- The container has a fixed height (or width for horizontal), so the scroll region is stable.

Do those three things and hydration is clean by construction.
