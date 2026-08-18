---
'@laynjs/adapter-utils': minor
'@laynjs/angular': minor
'@laynjs/core': minor
'@laynjs/dom': minor
'@laynjs/qwik': minor
'@laynjs/react': minor
'@laynjs/solid': minor
'@laynjs/svelte': minor
'@laynjs/vanilla': minor
'@laynjs/vue': minor
---

The published type declarations are now documented, so your editor explains the API without a trip
to the website.

Every public type, option and entry point carries documentation: what an option does, what it
defaults to, and, where it matters, why it works the way it does. Hovering `useLayn` shows a
complete example. Hovering `entry.ref` tells you to attach it to a wrapper rather than to an
`<img>`. Hovering `onReachEnd` explains that it is latched against the content size, so you do not
need a guard flag of your own. `binPacking` says outright that it is the expensive one and points at
`packing` instead.

Nothing about the runtime changed; this is documentation shipped inside the `.d.ts` files.
