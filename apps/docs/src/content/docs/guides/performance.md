---
title: Performance
description: Measured layout throughput and memory for the layn engine.
---

layn is fast because of how it stores data, not because of low-level tricks. Positions live in flat
`Float64Array` buffers, appends reuse shared buffers, and virtualization queries a spatial index. It is
all plain TypeScript with a zero-dependency core.

All numbers below are from our own benchmark suite, measured on Node with Apple Silicon, best of five
runs. Reproduce them with `pnpm bench` in the repository.

## Full-layout time per algorithm

Time to compute a complete layout for a given item count (single recompute):

| algorithm | 1k | 5k | 10k | 50k | complexity |
| --- | --- | --- | --- | --- | --- |
| masonry, columns, justified, staggered, magazine, horizontal | ~0.1 ms | ~0.1 ms | ~0.2 ms | up to 0.5 ms | O(n) |
| packing (skyline) | 0.2 ms | 0.5 ms | 0.7 ms | 3.6 ms | O(n) amortized |
| quilt | 0.1 ms | 0.4 ms | 0.4 ms | 1.9 ms | near O(n) |
| bin-packing (maxrects) | 4.5 ms | 27 ms | 55 ms | 279 ms | O(n * cap^2) |

`binPacking` is the deliberate premium tight-packer. When you need speed at very large counts, use
`packing`, which is O(n).

[`sections`](/guides/sections/) wraps another algorithm and runs it once per group, then merges the
results, so it costs roughly 3-4x the algorithm it wraps: a 50,000-item grouped masonry layout is
about 3.9 ms against 1.1 ms ungrouped. It stays linear in the number of items. Pinning a header costs
nothing measurable - under a microsecond per scroll frame, even with two thousand sections.

## Engine primitives

On the masonry path, at 100,000 items:

| operation | time |
| --- | --- |
| Build the spatial index | 2.3 ms |
| 1,000 scroll queries | 1.6 ms (about 1.5 microseconds each) |
| Append one item | 0.22 ms (amortized O(added)) |
| Memory (items plus index) | about 27 MB |

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
