---
title: Performance
description: Measured layout throughput and memory for the layn engine.
---

layn is fast because of how it stores data, not because of low-level tricks. Positions live in flat
`Float64Array` buffers, appends reuse shared buffers, and virtualization queries a spatial index. It is
all plain TypeScript with a zero-dependency core.

Every number on this page comes from the benchmark in the repository, and you can run it yourself:

```bash
git clone https://github.com/laynjs/layn.git
cd layn && pnpm install && pnpm bench
```

The figures below were measured on Node 24 on Apple Silicon, best of five runs (three at 50k). Your
machine will differ; the shape of the curve will not.

## Full-layout time per algorithm

Time to compute a complete layout for a given item count (single recompute):

| algorithm | 1k | 5k | 10k | 50k | complexity |
| --- | --- | --- | --- | --- | --- |
| masonry, columns, justified, staggered, magazine, horizontal | 0.04-0.10 ms | ~0.1 ms | 0.2-0.4 ms | 0.4-0.6 ms | O(n) |
| packing (skyline) | 0.13 ms | 0.40 ms | 0.78 ms | 3.6 ms | O(n) amortized |
| quilt | 0.10 ms | 0.45 ms | 0.44 ms | 2.2 ms | near O(n) |
| bin-packing (maxrects) | 4.4 ms | 27 ms | 54 ms | 277 ms | O(n * cap^2) |

`binPacking` is the deliberate premium tight-packer. When you need speed at very large counts, use
`packing`, which is O(n).

## Sections and sticky headers

[`sections`](/guides/sections/) wraps another algorithm, runs it once per group and merges the
results, so it costs more than the algorithm alone. At 50,000 items in 500 groups that is 2.2 ms
against 1.3 ms ungrouped, about 1.7x. The overhead follows the number of groups rather than the
number of items, so it is flat across realistic groupings and only becomes noticeable when groups
get very small:

| groups (50k items) | time |
| --- | --- |
| none (plain masonry) | 1.3 ms |
| 50 | 1.9 ms |
| 250 | 2.1 ms |
| 1,000 | 2.2 ms |
| 5,000 | 7.2 ms |

Pinning a header is not measured in layout at all. It recomputes section bounds once per layout
(0.4 ms with 2,000 sections) and then costs about a microsecond per scroll frame.

## Engine primitives

On the masonry path, at 100,000 items:

| operation | time |
| --- | --- |
| Build the spatial index | 2.5 ms |
| 1,000 scroll queries | 0.9 ms (about 0.9 microseconds each) |
| Append one item | 0.14 ms (amortized O(added)) |
| Memory retained (items plus index) | about 12 MB |

The memory figure is what is still held after a collection, which works out at roughly 120 bytes per
item for the item records, the four position arrays and the spatial index together. `pnpm bench`
measures it with `--expose-gc` so the number is the retained heap rather than whatever garbage the
layout run happened to leave behind.

## Why no WebAssembly

The bottleneck in layout is allocation and memory traffic, not arithmetic. Moving positions to
struct-of-arrays storage produced multi-times speedups in pure TypeScript, and the two algorithmic
cliffs that ever showed up (in bin-packing and quilt) were fixed by better data structures, not by a
faster language. A zero-dependency, WebAssembly-free core keeps the supply chain small and the build
trivial.

## Practical tips

- Give items an `aspectRatio` so the first render is correct and measurement only refines.
- Memoize the algorithm object to skip the equality comparison on re-render (an equivalent algorithm is
  already a no-op, this just skips the check).
- Use `appendItems` for infinite scroll; masonry appends are O(added) and identical to a full recompute.
- Tune `overscan` to trade a few more rendered items for smoother fast scrolling.
