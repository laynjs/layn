---
'@laynjs/core': minor
'@laynjs/dom': minor
---

Custom layout algorithms are now a supported, documented API, and there is a devtools overlay.

`@laynjs/core` exports the primitives the built-in algorithms are made of, so a third-party algorithm
is a first-class one: `createPositionsBuilder` writes rectangles straight into the engine's flat
buffers, `mirrorExtent` gives right-to-left support in a single argument, and `resolveColumnCount`,
`resolveRowCount` and `resolveTrackSize` bring responsive breakpoint maps along. The full walkthrough
is in the new "Write your own algorithm" guide, and the example it teaches is locked by a test.

`engine.isMeasured(id)` reports whether a real DOM measurement has been recorded for an item, which
is useful on its own (a skeleton until a tile is measured) and is what the overlay reads.

`@laynjs/dom` adds `createDevtools`, an overlay that draws every item rectangle over your grid,
marks which tiles are measured rather than estimated, shows the overscan band, and prints how many
of your items are actually in the DOM. It is a canvas with `pointer-events: none`, so it never
interferes, and it disappears from production builds when the call is unreachable.
