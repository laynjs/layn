import { ChangeDetectionStrategy, Component } from '@angular/core'
import { LaynContainerDirective, LaynItemDirective, useLayn } from '@laynjs/angular'
import { masonry } from '@laynjs/core'

const data = Array.from({ length: 500 }, (_, index) => ({
  id: index,
  aspectRatio: 1,
  data: index,
}))

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LaynContainerDirective, LaynItemDirective],
  template: `
    <div [laynContainer]="view" data-testid="container" [style]="containerCss()">
      <div data-testid="content" [style]="css(view.contentStyle())">
        @for (entry of view.items(); track entry.id) {
          <div
            [laynItem]="{ ref: view, id: entry.id, rect: entry.rect }"
            data-testid="item"
            [attr.data-id]="entry.id"
            style="background:#dddddd"
          >
            {{ entry.item.data }}
          </div>
        }
      </div>
    </div>
  `,
})
export class AppComponent {
  protected readonly view = useLayn<number>({
    algorithm: masonry({ columns: 3 }),
    items: data,
    gap: { x: 8, y: 8 },
    viewport: { width: 900, height: 600 },
    overscan: 200,
  })

  protected css(style: Record<string, string>): string {
    return Object.entries(style)
      .map(([key, value]) => `${key}:${value}`)
      .join(';')
  }

  protected containerCss(): string {
    return `${this.css(this.view.containerStyle)};width:900px;height:600px`
  }
}
