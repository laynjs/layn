---
title: Adapters overview
description: How the framework adapters wrap the layn engine, and what they all share.
---

Every adapter wraps the same engine in one framework's idioms. They are thin: the engine does the
work, the adapter connects it to your component tree, your scroll container, and your reactivity.

## What every adapter gives you

- A **`useLayn`** primitive (or `createLayn` for vanilla) that creates the engine eagerly, so it is
  correct during SSR before any effect runs.
- A **scroll container** binding attached on mount, wired to a `ResizeObserver` (viewport size), a
  throttled scroll listener (visible set), and per-item `ResizeObserver`s (measured sizes).
- A **visible slice** of item view-models, each with a `style` (absolute position), a `ref` (measures
  the element), and accessibility attributes.
- Reactive **`algorithm`**, **`gap`**, and **`items`** inputs synced into the engine.
- Escape hatches: the raw `engine` and the total `contentSize`.

## The shared shape

Names differ per framework, but the pieces are the same everywhere:

| Concept | Purpose |
| --- | --- |
| container binding | The scroll element. Gets position, overflow, keyboard focus, and the region role. |
| content wrapper | The sizing element. Gets the total content size and `role="list"`. |
| visible items | Only the on-screen items. Each has `style`, `ref`, and `a11y`. |
| setters / reactive inputs | Change algorithm, gap, or items and the layout recomputes. |

## Common options

Every `useLayn` accepts these (Vue and Solid also accept reactive wrappers for the marked ones):

| Option | Type | Description |
| --- | --- | --- |
| `items` | `LayoutItem[]` | The items to lay out. |
| `algorithm` | `LayoutAlgorithm` | The layout algorithm. |
| `gap` | `Gap` | `{ x, y }` spacing. |
| `viewport` | `Viewport` | Initial container size; the binding keeps it current. |
| `axis` | `ScrollAxis` | `'vertical'` (default) or `'horizontal'`. |
| `overscan` | `number` | Extra pixels rendered beyond the viewport. |
| `label` | `string` | Accessible name for the scroll region. |
| `animate` | `boolean \| { duration, easing }` | Animate layout changes. See the [animations guide](/guides/animations/). Not available in Qwik. |
| `scroll` | `'container' \| 'window'` | Scroll the container (default) or the page. See the [scrolling guide](/guides/scrolling/). |
| `measurements` | `MeasurementsOptions` | Estimator and fallback ratio. |

Every adapter also returns **`scrollToItem(id, options?)`** and **`scrollToIndex(index, options?)`**
for programmatic scrolling, with `align: 'start' | 'center' | 'end'` and an optional smooth
`behavior`. See the [scrolling guide](/guides/scrolling/).

## Pick your framework

- [React](/adapters/react/) - `useSyncExternalStore` hook, props-spread API.
- [Vue](/adapters/vue/) - composition API composable, reactive inputs.
- [Svelte](/adapters/svelte/) - Svelte 5 runes, stores and `use:` actions.
- [Solid](/adapters/solid/) - signals primitive with stable item references.
- [Angular](/adapters/angular/) - signals factory and standalone directives.
- [Qwik](/adapters/qwik/) - resumable hook with `noSerialize` engine.
- [Vanilla](/adapters/vanilla/) - imperative controller and `renderToString`.

## Accessibility

Every adapter emits the same accessibility contract by default: a keyboard-focusable scroll region, a
`role="list"` content wrapper, and `role="listitem"` items that carry `aria-setsize` and
`aria-posinset` so assistive tech announces the true collection size even though only a slice is in the
DOM. See the [accessibility guide](/guides/accessibility/).
