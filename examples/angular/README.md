# @laynjs/angular example

A live demo of the headless Angular adapter, plus a Playwright e2e (client render + virtualization).

```bash
pnpm --filter @laynjs/example-angular dev    # live demo on http://localhost:5193
pnpm build && pnpm --filter @laynjs/example-angular e2e   # render + virtualization + scroll e2e
```

## Usage

`useLayn` is a factory called in an injection context (a component field initializer). It returns
Angular signals (`items`, `contentStyle`, `totalSize`) plus imperative `setItems` / `setAlgorithm` /
`setGap` that you push reactive inputs into from `effect`. Two standalone directives wire the DOM:
`[laynContainer]` attaches the scroll binding after the view initializes, and `[laynItem]`
positions and measures each tile, so a single directive per tile is all you need.

```ts
import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core'
import { LaynContainerDirective, LaynItemDirective, useLayn } from '@laynjs/angular'
import { masonry, type LayoutItem } from '@laynjs/core'

@Component({
  selector: 'gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LaynContainerDirective, LaynItemDirective],
  template: `
    <div [laynContainer]="view" [style]="css(view.containerStyle)" style="height:100vh">
      <div [style]="css(view.contentStyle())">
        @for (entry of view.items(); track entry.id) {
          <div [laynItem]="{ ref: view, id: entry.id, rect: entry.rect }">
            <img [src]="entry.item.data.src" alt="" />
          </div>
        }
      </div>
    </div>
  `,
})
export class Gallery {
  readonly photos = signal<Photo[]>([])
  private readonly data = computed<LayoutItem<Photo>[]>(() =>
    this.photos().map((p) => ({ id: p.id, aspectRatio: p.width / p.height, data: p })),
  )

  protected readonly view = useLayn<Photo>({
    algorithm: masonry({ columnWidth: 240 }),
    items: this.data(),
    gap: { x: 12, y: 12 },
    overscan: 300,
  })

  constructor() {
    effect(() => this.view.setItems(this.data()))
  }

  protected css(style: Record<string, string>): string {
    return Object.entries(style)
      .map(([key, value]) => `${key}:${value}`)
      .join(';')
  }
}
```

Positions come from `aspectRatio` (data, not the DOM), so the layout is SSR-deterministic. The
adapter drives change detection through signals, so it works zoneless (the demo bootstraps with
`provideZonelessChangeDetection()`). The DOM bindings are client-only; a server render uses the
eager engine snapshot.
