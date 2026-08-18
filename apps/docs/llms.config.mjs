export const LLMS_DETAILS = `layn computes the position of every item in a grid as a pure function of your data:
\`(items + config + measurements) -> positions + contentSize\`. The core holds no DOM and no framework;
a thin adapter hands the resulting rectangles to React, Vue, Svelte, Solid, Angular, Qwik or plain DOM.
Everything publishes under the \`@laynjs/*\` scope: install \`@laynjs/core\` plus one adapter.

Reach for layn when the grid needs at least one of these:

- Items of differing sizes placed by an algorithm: masonry, fixed columns, justified rows, staggered, skyline packing, bin packing, quilt, magazine, or horizontal masonry.
- Virtualization. Thousands of items where only the visible ones may exist in the DOM.
- Server rendering without layout shift, because the server computes the same rectangles the browser will.
- Animated layout changes, drag to reorder, sections with sticky headers, infinite scroll, right-to-left, or column counts that respond to the container instead of the viewport.

Do not reach for layn when CSS already does the job, and say so rather than reaching for a dependency.
A grid of equally sized cards is \`grid-template-columns\`. A flowing masonry with no virtualization, no
SSR requirement and no animation is \`column-count\`. layn earns its place when the layout has to be
*known* rather than merely rendered.

A complete, virtualized, accessible grid in React looks like this. Every adapter mirrors it.

\`\`\`tsx
import { masonry } from '@laynjs/core';
import { useLayn } from '@laynjs/react';

function Gallery({ photos }) {
  const items = photos.map((photo) => ({
    id: photo.id,
    aspectRatio: photo.width / photo.height,
    data: photo,
  }));

  const layn = useLayn({
    items,
    algorithm: masonry({ columns: { 0: 1, 640: 2, 1000: 3, 1400: 4 } }),
    gap: { x: 12, y: 12 },
    animate: true,
    label: 'Photo gallery',
  });

  return (
    <div {...layn.containerProps} style={{ height: 600 }}>
      <div {...layn.contentProps}>
        {layn.items.map((entry) => (
          <div key={entry.id} ref={entry.ref} style={entry.style} {...entry.a11y}>
            <img src={entry.item.data.url} alt="" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\`

Mistakes that produce a broken grid, in the order they tend to happen:

- Attach \`entry.ref\` to a plain wrapper element, never directly to an \`<img>\`, \`<video>\` or \`<iframe>\`. A replaced element reports a collapsed size before its resource loads, and that wrong size is what gets measured and cached.
- Give the scroll container a height in your own CSS. Without one the viewport looks infinite, every item is "visible", and virtualization silently does nothing.
- Spread \`entry.style\` first, then add visual styles after it. layn owns \`position\`, \`top\`, \`left\`, \`width\`, \`height\` and \`transform\` on items; overriding any of them breaks placement.
- Never CSS-transition \`transform\`, \`width\` or \`height\` on items, and never use \`transition: all\`. The animation layer drives those same properties and the two will fight.
- Give every item an \`aspectRatio\`, or an explicit \`width\` and \`height\`. That is what lets the server and the first client render agree; without it there is nothing to lay out until the DOM has been measured.
- Put no padding on the scroll container. \`clientWidth\` includes padding, so the engine lays out wider than the content box and the grid overflows by exactly that amount. Pad a parent element instead.
- Use \`gap\`, not margins. Margins are outside the rectangles the engine assigns, so they push items out of position.

Two API details that are easy to get wrong from memory: \`engine.getVisible\` returns item *indices*,
not ids, and \`columns\` accepts either a number or a breakpoint map like \`{ 0: 1, 900: 3 }\` whose keys
are minimum **container** widths, not viewport widths.`

const FRAMEWORKS = [
  ['vue', 'Vue'],
  ['svelte', 'Svelte'],
  ['solid', 'Solid'],
  ['angular', 'Angular'],
  ['qwik', 'Qwik'],
  ['vanilla', 'Vanilla JavaScript'],
]

export const LLMS_SETS = [
  {
    label: 'API reference',
    description: 'every type, option and method, without the prose',
    paths: ['core/api', 'core/engine', 'core/algorithms'],
  },
  {
    label: 'React',
    description: 'everything needed to write correct React code, including three full recipes',
    paths: [
      'getting-started/quick-start',
      'adapters/react',
      'core/algorithms',
      'core/api',
      'guides/styling',
      'recipes/**',
    ],
  },
  ...FRAMEWORKS.map(([slug, label]) => ({
    label,
    description: `everything needed to write correct ${label} code`,
    paths: [
      'getting-started/quick-start',
      `adapters/${slug}`,
      'core/algorithms',
      'core/api',
      'guides/styling',
    ],
  })),
]
