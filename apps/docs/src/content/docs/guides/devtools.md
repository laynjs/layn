---
title: Devtools overlay
description: Draw the engine's own rectangles over your grid to see what is laid out, what is rendered, and what has been measured.
---

The engine knows the position of every item, including the ones that are not in the DOM. The devtools
overlay draws that knowledge on top of your grid, which turns "the layout looks wrong" into a
question you can answer by looking.

```ts
import { createDevtools } from '@laynjs/dom';

const devtools = createDevtools({
  engine: layn.engine,
  container: scrollElement,
  overscan: 400,
});

devtools.show();
```

![The devtools overlay on a photo grid: a readout in the corner showing 240 items with 26 rendered, green outlines around every measured tile, and dashed lines marking the overscan band](/media/devtools.webp)

Try it in the [playground](https://play.layn.io): the **Devtools** switch at the bottom of the
inspector.

## What you are looking at

| Drawing | Meaning |
| --- | --- |
| Green outline | The item's size came from a real DOM measurement. |
| Amber outline | The size is still derived from your data: `aspectRatio`, `width`/`height`, or the estimator. |
| Dashed lines | The edges of the overscan band. Items between a dashed line and the edge of the container are rendered but off-screen. |
| Readout | Item count, how many are rendered, how many of those are measured, scroll offset, overscan, content size. |

Two things this makes obvious immediately:

**Virtualization is working, or it is not.** If `rendered` is close to `items`, something is keeping
every item in the DOM. The usual cause is a container with no height, so the viewport looks infinite.

**A tile is measuring wrong.** An outline that does not match the tile you can see means the engine
and the DOM disagree about that item's size. The classic cause is a `ref` on an `<img>` rather than
on a wrapper, so a collapsed pre-load box gets reported as the truth. See
[measurement](/core/measurement/).

## API

```ts
interface DevtoolsOptions {
  engine: LayoutEngine;
  container: HTMLElement;
  scroll?: HTMLElement | Window;
  axis?: 'vertical' | 'horizontal';
  overscan?: number;
  environment?: Partial<DomEnvironment>;
}

interface Devtools {
  show(): void;
  hide(): void;
  toggle(): boolean;
  refresh(): void;
  destroy(): void;
}
```

`container` is the scrolling element, the one you spread `containerProps` onto. `scroll` only needs
setting when you scroll the window rather than the container; pass the same value you gave the
adapter's `scroll` option. Pass the same `overscan` and `axis` you gave the adapter, or the bands
will be drawn for a configuration you are not using.

The overlay is a `<canvas>` placed over the container's box with `pointer-events: none`, so it never
interferes with your app. It repaints on layout changes, on scroll and on resize, throttled to one
frame.

## Getting the container element

Adapters give you a ref for the container. In React, compose it so you keep your own reference:

```tsx
const container = useRef<HTMLElement | null>(null);
const attach = layn.containerProps.ref;

const setContainer = useCallback(
  (element: HTMLElement | null) => {
    container.current = element;
    attach(element);
  },
  [attach],
);

<div {...layn.containerProps} ref={setContainer} />;
```

Spread `containerProps` **first** so your `ref` replaces the one it carries, and keep the callback
stable with `useCallback`, or every render will detach and re-attach the binding.

## Keeping it out of production

`createDevtools` is a normal export, so bundlers drop it when it is unreachable. Guard the call and
the whole overlay disappears from a production build:

```ts
if (import.meta.env.DEV) {
  createDevtools({ engine: layn.engine, container }).show();
}
```

## Measured or not, without the overlay

The same information the overlay uses is on the engine:

```ts
engine.isMeasured(id); // boolean
```

That is useful on its own: show a skeleton until an item has been measured, or assert in a test that
your grid stopped relying on estimates.
