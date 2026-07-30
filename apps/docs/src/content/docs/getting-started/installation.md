---
title: Installation
description: Install the layn core engine and the adapter for your framework.
---

layn is published as a small set of scoped packages. You always install the core engine plus the
adapter for your framework. Everything is ESM-only and ships with TypeScript types.

## Packages

| Package | What it is |
| --- | --- |
| `@laynjs/core` | The engine, algorithms, measurement, serialization. Zero runtime dependencies. |
| `@laynjs/dom` | Browser glue: `ResizeObserver` measurement, scroll tracking, virtualization binding. |
| `@laynjs/react` | Headless `useLayn` hook for React. |
| `@laynjs/vue` | Headless `useLayn` composable for Vue 3. |
| `@laynjs/svelte` | Headless `useLayn` stores and actions for Svelte 5. |
| `@laynjs/solid` | Headless `useLayn` signals primitive for Solid. |
| `@laynjs/angular` | Headless `useLayn` factory and directives for Angular. |
| `@laynjs/qwik` | Headless `useLayn` resumable hook for Qwik. |
| `@laynjs/vanilla` | Framework-free `createLayn` controller and `renderToString`. |

The framework adapters depend on `@laynjs/core` and `@laynjs/dom` for you, so a single install line is
enough.

## Install

Pick your framework. The example below uses React; swap `@laynjs/react` for the adapter you need.

```bash
# npm
npm install @laynjs/core @laynjs/react

# pnpm
pnpm add @laynjs/core @laynjs/react

# yarn
yarn add @laynjs/core @laynjs/react

# bun
bun add @laynjs/core @laynjs/react
```

For the vanilla adapter (no framework), install `@laynjs/core` and `@laynjs/vanilla`:

```bash
npm install @laynjs/core @laynjs/vanilla
```

## Use it from a CDN (no build step)

You do not need npm or a bundler at all. Every package is standard ESM, so you can import layn
straight from an ESM CDN such as [esm.sh](https://esm.sh) or [jsDelivr](https://www.jsdelivr.com) in a
plain `<script type="module">`. The core engine is framework-free, so this runs anywhere a browser does:

```html
<script type="module">
  import { createEngine, masonry } from 'https://esm.sh/@laynjs/core';

  const engine = createEngine({
    algorithm: masonry({ columns: 4 }),
    items: myItems,
    gap: { x: 12, y: 12 },
    viewport: { width: 960, height: 600 },
  });

  const { positions } = engine.getSnapshot();
</script>
```

Pin a version in production so the URL never shifts under you (append `@` and the version):

```html
<script type="module">
  import { createLayn } from 'https://esm.sh/@laynjs/vanilla@1.0.0';
  createLayn(document.getElementById('grid'), { algorithm: masonry({ columns: 4 }), items: myItems });
</script>
```

The framework adapters load the same way (`https://esm.sh/@laynjs/react`, and so on) and the CDN
resolves their peer dependencies for you. jsDelivr works identically with
`https://cdn.jsdelivr.net/npm/@laynjs/core/+esm`.

## Requirements

- **ES modules.** layn is ESM-only. Use a bundler or a runtime that supports ESM (Vite, Next.js,
  Astro, SvelteKit, Nuxt, Node 20+, and so on).
- **TypeScript is optional but first-class.** Types ship with every package. Nothing extra to install.
- **Peer dependencies.** Each adapter lists your framework as a peer dependency, so it uses the
  version already in your project.

## Next

Head to the [quick start](/getting-started/quick-start/) to render your first virtualized grid, or
read the [core concepts](/getting-started/concepts/) to understand how the engine works before you
wire it up.
