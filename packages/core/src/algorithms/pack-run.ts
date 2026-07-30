import { positionsBuilder } from '../positions/positions.js'
import type { LayoutContext, LayoutItem, LayoutResult } from '../types/index.js'
import type { Packer } from './types.js'

export const runPacking = (
  items: readonly LayoutItem[],
  context: LayoutContext,
  base: number,
  makePacker: (containerWidth: number) => Packer,
): LayoutResult => {
  const { viewport, gap, measurements } = context
  const containerWidth = Math.max(1, viewport.width)
  const packer = makePacker(containerWidth + gap.x)
  const builder = positionsBuilder(items.length)
  let bottom = 0

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    if (item === undefined) {
      continue
    }
    const ratio = measurements.aspectRatio(item)
    let width = ratio * base
    let height = base
    if (width > containerWidth) {
      height = height * (containerWidth / width)
      width = containerWidth
    }
    const placement = packer.place(width + gap.x, height + gap.y)
    if (placement === undefined) {
      continue
    }
    builder.push(item.id, placement.x, placement.y, width, height)
    bottom = Math.max(bottom, placement.y + height)
  }

  return {
    positions: builder.build(),
    contentSize: { width: viewport.width, height: bottom },
  }
}
