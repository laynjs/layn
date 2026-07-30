# @laynjs/angular

The Angular adapter for [layn](https://layn.io), the headless layout engine. Signal-based and zoneless, with standalone directives, virtualized and deterministic across hydration.

## Install

```bash
npm install @laynjs/angular @laynjs/core
```

Requires `@angular/core` ^19, ^20, or ^21 as a peer dependency.

## Usage

```ts
import { Component } from '@angular/core'
import { LaynContainerDirective, LaynItemDirective, useLayn } from '@laynjs/angular'
import { masonry } from '@laynjs/core'

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [LaynContainerDirective, LaynItemDirective],
  template: `
    <div [laynContainer]="layn" [style]="css(layn.containerStyle)">
      <div [style]="css(layn.contentStyle())">
        @for (tile of layn.items(); track tile.id) {
          <div [laynItem]="{ ref: layn, id: tile.id, rect: tile.rect }"></div>
        }
      </div>
    </div>
  `,
})
export class GalleryComponent {
  protected readonly layn = useLayn({
    items,
    algorithm: masonry({ columnWidth: 236 }),
    gap: { x: 12, y: 12 },
  })
}
```

`useLayn` returns Angular signals; the `[laynContainer]` and `[laynItem]` directives handle mounting and measurement.

## Documentation

Full guides and API reference: [docs.layn.io](https://docs.layn.io/adapters/angular)

## License

[MIT](https://github.com/laynjs/layn/blob/main/LICENSE)
