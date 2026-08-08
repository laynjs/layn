---
title: Styling
description: What layn writes to your elements, what is yours, and the few CSS rules that keep the two from fighting.
---

layn is headless: it computes rectangles and writes the CSS that positions them. It never sets a
colour, a corner, a border, a font or a shadow. Everything your grid looks like is your own CSS.

## What layn writes

Exactly these properties, and nothing else:

| Element | Properties layn sets |
| --- | --- |
| Scroll container | `position: relative`, `overflow: auto` (dropped in window-scroll mode) |
| Content wrapper | `position: relative`, `width`, `height` |
| Each item | `position: absolute`, `top: 0`, `left: 0`, `width`, `height`, `transform: translate(x, y)` |

Treat those as owned by the engine. Everything else - background, border, radius, shadow, padding,
typography, cursor, filters - is yours, and you add it the way you add any other style:

```tsx
{layn.items.map((entry) => (
  <div
    key={entry.id}
    ref={entry.ref}
    style={{ ...entry.style, borderRadius: 12 }}
    className="tile"
    {...entry.a11y}
  />
))}
```

A `className` is usually the better place for anything static. Spread `entry.style` only when the
value is dynamic, as above - and always spread it **first**, so a stale visual value can never
overwrite the geometry.

## The rules that matter

**Never override the geometry.** Setting your own `position`, `width`, `height`, `top`, `left` or
`transform` on an item detaches it from the layout. The engine will keep computing the right
rectangle and the DOM will keep ignoring it.

**Do not transition or animate `transform`, `width` or `height` yourself.** Those are the exact
properties the engine writes on every commit, and a CSS transition on them fights the
[animation layer](/guides/animations/), which uses the Web Animations API on the same properties.
If you want motion, turn on `animate`. A blanket `transition: all` on a tile is the usual way people
hit this.

**Keep `box-sizing: border-box`.** layn sizes an item to the rectangle it computed. Under
`content-box` a border or padding is added *outside* that size, so every tile ends up a few pixels
bigger than its slot and the grid overlaps.

**Put no padding on the scroll container.** `clientWidth` includes padding, so the engine lays out
for a width the content area does not actually have and the grid overflows by exactly your padding.
Put the padding on a parent instead:

```css
.frame  { padding: 16px; }
.scroll { height: 100%; }
```

**Space items with `gap`, not `margin`.** A margin on an absolutely positioned item does nothing
useful here - the engine already positioned it. `gap` is a layout input, so the engine accounts for
it when it computes columns and rows.

## Tiles that contain an image

Wrap it. Put the ref on a plain `<div>` and the image inside:

```tsx
<div ref={entry.ref} style={{ ...entry.style, borderRadius: 12, overflow: 'hidden' }}>
  <img src={entry.item.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
</div>
```

Measuring an `<img>` directly is the single most common way to break a layn grid: a replaced element
reports a collapsed box before its resource loads, that near-zero height reaches the engine, and the
whole layout folds. See [Measurement](/core/measurement/) for the full story.

`overflow: hidden` on the wrapper is what makes the radius clip the photo.

## State hooks

The engine marks items during interactions so you can style them without tracking state yourself:

| Attribute | On | Meaning |
| --- | --- | --- |
| `data-layn-dragging` | the held item | A drag is in progress |
| `data-layn-exiting` | an exit clone | The item was removed and is animating out |

```css
[data-layn-dragging] {
  cursor: grabbing;
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.35);
}
```

Draggable items also need `touch-action: none`, or a touch drag is treated as a scroll - see
[Drag and drop](/guides/drag-and-drop/).

The `@laynjs/vanilla` adapter additionally writes `data-layn-content` on the content wrapper and
`data-layn-id` on each item, so it can adopt server-rendered nodes on hydration. They are structural
markers, but they are stable and safe to select on.

## Sizing the container

layn lays out into whatever box the scroll container has, so give it a height the way you would any
other scrolling element - a fixed height, a grid or flex track, or `100%` of a sized parent:

```css
.scroll {
  height: 70vh;
}
```

In window-scroll mode there is no inner scroller and no height to set; the page scrolls and the
content wrapper's own height reserves the space. See [Scrolling](/guides/scrolling/).
