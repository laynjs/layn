# layn + React template

A minimal, runnable starting point: a virtualized masonry grid with responsive column counts and
animated layout changes.

[Open it in StackBlitz](https://stackblitz.com/github/laynjs/layn/tree/main/templates/react) to run it
in the browser with no setup, or locally:

```bash
npm install
npm run dev
```

## What it shows

- `masonry` with a breakpoint map, so the column count follows the **container** width.
- Virtualization: the header prints how many of the items are actually in the DOM.
- `animate: true`, so **Shuffle** moves tiles rather than snapping them.
- `Add 100`, an append, which is the incremental path in the engine.

## Where to go next

- Attach real content: give each item a `data` field and read it as `entry.item.data`. Typing your
  items as `LayoutItem<YourData>` makes `data` required and fully typed.
- Swap the algorithm: `columns`, `justified`, `quilt`, `packing` and the rest take the same shape.
- [Documentation](https://docs.layn.io) and the [playground](https://play.layn.io).
