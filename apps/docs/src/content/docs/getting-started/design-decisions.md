---
title: Design decisions
description: Why layn computes layout in JavaScript, why the core is headless and dependency-free, and when you should not use it.
---

Every choice below has a cost. This page states what each one bought and what it gave up, including
the cases where the answer is "do not use this library".

## Why compute layout at all, when CSS can do it?

For a static grid, CSS is the right answer and you should use it. `flex` and `grid` handle uniform
tiles, `column-count` handles a simple flowing wall. If that is your problem, stop here.

layn exists for the cases where the browser's own layout cannot help you:

**Virtualization.** CSS lays out what is in the DOM. To place item 40,000 the browser needs all
40,000 elements, which is exactly what you are trying to avoid. Knowing where an item *would* be
without rendering it is not something CSS can express, and it is the entire basis of virtualized
scrolling.

**The server does not have a browser.** CSS layout resolves in the client, after the HTML arrives.
The server cannot know the result, so it cannot send markup that is already in its final shape. layn
computes rectangles from your data, so the server and the client agree before a single pixel is
painted.

**Reading order.** A flowing column layout distributes items down each column in turn, so what reads
as "second" is often halfway down the page. layn separates the placement rule from the source order,
which is why `columns` (round-robin) and `masonry` (shortest column) are different algorithms rather
than different CSS.

**One layout, many uses.** Once a layout is a function, it can be tested, benchmarked, serialized,
diffed, animated between two states, and hit-tested for drag and drop. None of that is available when
the layout lives inside the rendering engine.

Native CSS masonry is coming, and it will be the better tool for the static case when it lands
everywhere. It still will not virtualize, and the server still will not know the answer.

## Why headless?

Because the alternative is owning your markup. A component that renders your grid has to have
opinions about elements, class names, images, links, keys and styling, and every real design
eventually fights one of them.

layn returns numbers. You render whatever you want with them, in whatever framework, and the parts
that are genuinely hard - measurement, virtualization, animation, hit-testing - are the parts you get.
The trade is that a first render takes a few more lines than dropping in a component. See
[styling](/guides/styling/) for the exact list of properties layn writes.

## Why does the engine want an aspect ratio?

This is the decision the whole library hangs on.

The common approach is to render items, measure them, then position them. That works, but it means
the first frame is wrong, and the server cannot participate at all because it has nothing to measure.

layn goes data-first: give an item its `aspectRatio` (or a `width`/`height`) and the layout is
computable anywhere, including on the server, including for item 40,000 which is not rendered. The
DOM is then used to *refine* what it already knows, through a `ResizeObserver`, and a refinement is
only trusted for the width it was taken at. Full order in [measurement](/core/measurement/).

You almost always know the aspect ratio: it is in the image record, the video metadata, the card's
own design. When you truly do not, you can supply an estimator and let measurement correct it.

## Why nine algorithms?

Because "masonry" is not one layout. A photo wall, a card dashboard, an editorial page and a film
strip all pack differently, and the differences are not styling - they are placement rules, each with
its own trade-off between reading order, packing density and empty space.

They also cost almost nothing to keep. Each algorithm is one small function, they share a handful of
helpers, and the ones you do not import are removed by tree-shaking. Bundling the engine with a
single algorithm is 3.2 kB min+gzip; the entire package, every algorithm included, is 6.5 kB.

There is no privileged set: the built-ins use the public API, and
[you can write your own](/guides/custom-algorithms/) in about thirty lines.

## Why no WebAssembly?

It was measured, and it would not have helped. The bottleneck in layout is memory traffic and
allocation, not arithmetic. Moving positions into flat `Float64Array` buffers - one number per field
per item, no objects - produced multiple-times speedups in plain TypeScript, and the two genuine
performance cliffs we ever hit were bad data structures, both fixed by better algorithms rather than
a faster language.

A 50,000 item masonry layout takes about half a millisecond. There is nothing left for WebAssembly to
win, and a WebAssembly core would cost a build step, a binary artifact and a much larger download.
See [performance](/guides/performance/), and run `pnpm bench` yourself.

## Why a zero-dependency core?

`@laynjs/core` has no runtime dependencies and does not reference the DOM. That is enforced
structurally rather than by discipline: it compiles without DOM type libraries, so DOM usage fails
the build.

The reason is supply chain and portability in equal measure. A layout engine has no business pulling
transitive packages into your application, and a core with no DOM runs unchanged in Node, in a
worker, and in edge runtimes.

## Why does layn own animation and drag and drop?

Because both need the layout, and doing them outside it goes wrong in ways that are hard to fix from
the outside.

Animating between two layouts requires both sets of rectangles, which the engine has and nothing else
does. Deleting an item is the awkward case: every framework unmounts the element before the layout
changes, so the transition layer animates a copy it kept.

Drag and drop needs hit-testing against positions, including positions of items that are not
rendered, and in right-to-left it needs the *mirrored* positions. That is why mirroring happens in
the engine rather than in CSS: everything reads the same numbers.

## When should you not use layn?

- **A static grid of uniform tiles.** Use CSS grid. It is less code and the browser is better at it.
- **A few dozen items with no interaction.** You will not benefit from virtualization, and a CSS
  column layout will be simpler.
- **A layout that must reflow around text content of unknown height with no estimate available.**
  layn will handle it through measurement, but the first frame is a guess, which loses the property
  that makes it worth using.
- **You want a drop-in component with a design already applied.** layn deliberately ships no visual
  styling at all.

## Is it stable?

The engine has been stable in shape since the first release: `(items + config + measurements) ->
positions + contentSize` has not changed. The library is pre-1.0 because the option surface is still
growing, and 1.0 will follow real-world use rather than a date.

Every release ships with unit tests, browser end-to-end tests, documentation and a playground demo,
and every package on npm carries a provenance attestation tying it to the commit and workflow that
built it.
