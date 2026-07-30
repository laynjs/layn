import { createLayn } from '@laynjs/vanilla'
import { hue, items, layouts } from './layouts'

const app = document.getElementById('app')
if (app !== null) {
  app.style.cssText = 'font-family:system-ui, sans-serif;padding:24px;max-width:940px;margin:0 auto'

  for (const spec of layouts) {
    const section = document.createElement('section')
    section.style.marginBottom = '28px'

    const grid = document.createElement('div')
    grid.style.cssText =
      'height:340px;border:1px solid #e5e5e5;border-radius:10px;background:#fafafa'

    section.append(grid)
    app.append(section)

    createLayn<number>(grid, {
      algorithm: spec.algorithm,
      items,
      gap: { x: 8, y: 8 },
      viewport: { width: 880, height: 340 },
      axis: spec.axis,
      overscan: 200,
      label: spec.label,
      renderItem: (element, item) => {
        element.style.background = `hsl(${hue(item.id as number)} 68% 66%)`
        element.style.borderRadius = '6px'
        element.style.display = 'flex'
        element.style.alignItems = 'center'
        element.style.justifyContent = 'center'
        element.style.color = 'rgba(0,0,0,0.5)'
        element.style.fontSize = '12px'
        element.style.fontWeight = '600'
        element.textContent = String(item.data)
      },
    })
  }
}
