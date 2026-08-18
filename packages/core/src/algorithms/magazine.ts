import { DEFAULT_MAGAZINE_TEMPLATES, DEFAULT_MAGAZINE_UNIT } from '../constants.js'
import { positionsBuilder } from '../positions/positions.js'
import type {
  LayoutAlgorithm,
  LayoutContext,
  LayoutItem,
  LayoutResult,
  MagazineOptions,
  MagazineRow,
} from '../types/index.js'
import { mirrorExtent } from './direction.js'

const resolveUnit = (options: MagazineOptions): number =>
  options.rowHeight !== undefined && options.rowHeight > 0
    ? options.rowHeight
    : DEFAULT_MAGAZINE_UNIT

const sumWeights = (weights: readonly number[], count: number): number => {
  let total = 0
  for (let k = 0; k < count; k += 1) {
    total += weights[k] ?? 0
  }
  return total
}

/** Rows cycling through editorial templates: a hero, a triptych, a duo, a feature. */
export const magazine = (options: MagazineOptions = {}): LayoutAlgorithm => ({
  name: 'magazine',
  capabilities: { incremental: false, requiresMeasuredHeight: false },
  layout(items: readonly LayoutItem[], context: LayoutContext): LayoutResult {
    const { viewport, gap } = context
    const unit = resolveUnit(options)
    const templates: readonly MagazineRow[] = options.templates ?? DEFAULT_MAGAZINE_TEMPLATES
    const builder = positionsBuilder(items.length, mirrorExtent(context))

    let top = 0
    let start = 0
    let rowIndex = 0
    while (start < items.length) {
      const template = templates[rowIndex % templates.length] ?? { weights: [1], height: 1 }
      const count = Math.min(template.weights.length, items.length - start)
      const rowHeight = template.height * unit
      const totalWeight = sumWeights(template.weights, count) || 1
      const available = Math.max(0, viewport.width - gap.x * (count - 1))

      let left = 0
      for (let k = 0; k < count; k += 1) {
        const item = items[start + k]
        const weight = template.weights[k] ?? 0
        if (item !== undefined) {
          const width = (weight / totalWeight) * available
          builder.push(item.id, left, top, width, rowHeight)
          left += width + gap.x
        }
      }

      top += rowHeight + gap.y
      start += count
      rowIndex += 1
    }

    return {
      positions: builder.build(),
      contentSize: { width: viewport.width, height: Math.max(0, top - gap.y) },
    }
  },
})
