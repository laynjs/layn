---
'@laynjs/adapter-utils': minor
'@laynjs/react': minor
'@laynjs/vue': minor
'@laynjs/svelte': minor
'@laynjs/solid': minor
'@laynjs/angular': minor
'@laynjs/qwik': minor
'@laynjs/vanilla': minor
---

No functional changes. Released in lockstep with the core so every `@laynjs/*` package stays on the
same version.

Everything new in this release lives in `@laynjs/core` and `@laynjs/dom`, and reaches the adapters
through the engine they already use: the stricter `LayoutItem<TData>` typing applies wherever you
pass items, and `createDevtools` works with the `engine` each adapter exposes.
