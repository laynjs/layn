---
'@laynjs/core': minor
---

`quilt` now honours a per-item `span`. An item that declares one becomes a square block that many
cells wide and tall, overriding the algorithm's repeating pattern - the hero image in a gallery, the
featured card in a dashboard. It is clamped to the grid, so a `span: 4` item stays valid when a narrow
viewport drops the layout to two columns.

Quilt is where this belongs: its cells are a fixed size, so a block of them fits exactly and smaller
items flow into whatever is left, leaving no empty space. Column-based algorithms like `masonry` grow
each column by whatever height its items happen to have, so a rigid multi-column item would need a
flat line that is essentially never there, and the difference would show as a gap. `span` continues to
be ignored by every algorithm other than `quilt`.

`span` has been part of the `LayoutItem` type since the first release but no algorithm implemented it
until now.
