---
'@laynjs/core': minor
'@laynjs/adapter-utils': minor
'@laynjs/react': minor
'@laynjs/vue': minor
'@laynjs/svelte': minor
'@laynjs/solid': minor
'@laynjs/angular': minor
'@laynjs/qwik': minor
'@laynjs/vanilla': minor
---

Right-to-left layouts. Pass `direction: 'rtl'` and the grid is mirrored across the container: the
first item sits against the right edge, columns fill leftwards, and any ragged edge falls on the left.

```ts
useLayn({ items, algorithm: masonry({ columns: 4 }), direction: 'rtl' });
```

The mirroring happens in the engine rather than in CSS, which is what keeps everything else working:
virtualization, `scrollToItem`, hit-testing and drag-to-reorder all run on the same coordinates the
browser paints, so a dragged tile still lands where you dropped it. Only `x` flips - `y`, `width`,
`height` and the content size are untouched, so a right-to-left grid is exactly as tall as its
left-to-right twin. The direction is carried through `serialize`/`hydrateEngine`, so SSR stays
deterministic.

Supported by every algorithm except `horizontalMasonry`, whose content grows past the container: there
is no fixed width to mirror against, and every append would shift everything already placed. Reverse a
horizontal scroller with CSS `direction: rtl` on the scroll container instead.

`direction` is read when the engine is created and does not change afterwards.
