import { ChangeDetectionStrategy, Component } from '@angular/core'
import { LaynContainerDirective, LaynItemDirective, type LaynRef, useLayn } from '@laynjs/angular'
import { hue, items, layouts } from './layouts'

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LaynContainerDirective, LaynItemDirective],
  template: `
    <div style="font-family:system-ui, sans-serif;padding:24px;max-width:940px;margin:0 auto">
      @for (entry of sections; track entry.id) {
        <section style="margin-bottom:28px">
          <div
            [laynContainer]="entry.view"
            [style]="containerCss(entry.view)"
            [attr.tabindex]="entry.view.containerAttrs.tabindex"
            [attr.role]="entry.view.containerAttrs.role"
            [attr.aria-label]="entry.view.containerAttrs['aria-label']"
          >
            <div [style]="css(entry.view.contentStyle())" [attr.role]="entry.view.contentAttrs.role">
              @for (tile of entry.view.items(); track tile.id) {
                <div
                  [laynItem]="{ ref: entry.view, id: tile.id, rect: tile.rect }"
                  [style]="tileCss(tile.index)"
                  [attr.role]="tile.a11y.role"
                  [attr.aria-setsize]="tile.a11y['aria-setsize']"
                  [attr.aria-posinset]="tile.a11y['aria-posinset']"
                >
                  {{ tile.index }}
                </div>
              }
            </div>
          </div>
        </section>
      }
    </div>
  `,
})
export class AppComponent {
  protected readonly sections = layouts.map((spec) => ({
    id: spec.id,
    view: useLayn<number>({
      algorithm: spec.algorithm,
      items,
      gap: { x: 8, y: 8 },
      viewport: { width: 880, height: 340 },
      axis: spec.axis,
      overscan: 200,
      label: spec.label,
    }),
  }))

  protected css(style: Record<string, string>): string {
    return Object.entries(style)
      .map(([key, value]) => `${key}:${value}`)
      .join(';')
  }

  protected containerCss(view: LaynRef<number>): string {
    return `${this.css(view.containerStyle)};height:340px;border:1px solid #e5e5e5;border-radius:10px;background:#fafafa`
  }

  protected tileCss(index: number): string {
    return `background:hsl(${hue(index)} 68% 66%);border-radius:6px;display:flex;align-items:center;justify-content:center;color:rgba(0,0,0,0.5);font-size:12px;font-weight:600`
  }
}
