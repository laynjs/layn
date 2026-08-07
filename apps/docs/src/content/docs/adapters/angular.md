---
title: Angular
description: The @laynjs/angular headless useLayn factory and standalone directives.
---

`@laynjs/angular` is a signals factory plus two standalone directives. It is zoneless (signals drive
change detection) and ships as partial-Ivy, AOT-linkable output.

## Install

```bash
npm install @laynjs/core @laynjs/angular
```

Peer dependency: Angular 19, 20, or 21.

## Usage

`useLayn` is called in an injection context (a component field initializer), where `inject` works.
The two directives wire the container and each item.

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { masonry } from '@laynjs/core';
import { LaynContainerDirective, LaynItemDirective, useLayn } from '@laynjs/angular';

@Component({
  selector: 'app-gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LaynContainerDirective, LaynItemDirective],
  template: `
    <div [laynContainer]="layn" [style]="css(layn.containerStyle)" style="height:600px"
         [attr.tabindex]="layn.containerAttrs.tabindex"
         [attr.role]="layn.containerAttrs.role"
         [attr.aria-label]="layn.containerAttrs['aria-label']">
      <div [style]="css(layn.contentStyle())" [attr.role]="layn.contentAttrs.role">
        @for (tile of layn.items(); track tile.id) {
          <div [laynItem]="{ ref: layn, id: tile.id, rect: tile.rect }"
               [style]="css(tile.style)"
               [attr.role]="tile.a11y.role"
               [attr.aria-setsize]="tile.a11y['aria-setsize']"
               [attr.aria-posinset]="tile.a11y['aria-posinset']">
            {{ tile.item.data }}
          </div>
        }
      </div>
    </div>
  `,
})
export class GalleryComponent {
  protected readonly layn = useLayn<string>({
    items: this.photos,
    algorithm: masonry({ columns: 4 }),
    gap: { x: 12, y: 12 },
    overscan: 200,
    label: 'Gallery',
  });

  protected css(style: Record<string, string>) {
    return Object.entries(style).map(([k, v]) => `${k}:${v}`).join(';');
  }
}
```

## What the factory returns

`useLayn` returns a `LaynRef` with:

| Member | Description |
| --- | --- |
| `items` | A signal of visible view-models. |
| `contentStyle` | A signal with the content-size style. |
| `totalSize` | A signal, `{ width, height }`. |
| `containerStyle` | Static style object. |
| `containerAttrs` / `contentAttrs` | Accessibility attributes. |
| `engine` | The raw engine. |
| `setItems` / `setAlgorithm` / `setGap` | Imperative updates, drive them from `effect`. |

The hook also accepts `animate` ([animations guide](/guides/animations/)) and `scroll: 'window'`
([scrolling guide](/guides/scrolling/)), and returns `scrollToItem(id, options?)` /
`scrollToIndex(index, options?)` for programmatic scrolling.

For infinite scroll, pass `onReachEnd` - see the [infinite scroll guide](/guides/infinite-scroll/).

## Directives

- `[laynContainer]="layn"` binds the scroll container after the view initializes.
- `[laynItem]="{ ref, id, rect }"` applies each item's position before observing its size.

They are the Angular equivalent of Svelte's actions and handle both lifecycle details for you.

## Reactivity

Sync reactive inputs from an `effect`:

```ts
effect(() => this.layn.setAlgorithm(this.rows() ? justified({ targetRowHeight: 200 }) : masonry({ columns: 4 })));
```
