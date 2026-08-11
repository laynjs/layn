import { positionsBuilder } from '../positions/positions.js'
import type {
  LayoutAlgorithm,
  LayoutContext,
  LayoutItem,
  LayoutResult,
  SectionsOptions,
} from '../types/index.js'
import type { SectionRun } from './types.js'

const NO_HEADER = -1

const runsOf = (
  items: readonly LayoutItem[],
  isHeader: (item: LayoutItem) => boolean,
): SectionRun[] => {
  const runs: SectionRun[] = []
  let header = NO_HEADER
  let start = 0

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]
    if (item === undefined || !isHeader(item)) {
      continue
    }
    if (i > start || header !== NO_HEADER) {
      runs.push({ header, start, end: i })
    }
    header = i
    start = i + 1
  }
  if (start < items.length || header !== NO_HEADER) {
    runs.push({ header, start, end: items.length })
  }
  return runs
}

export const sections = (inner: LayoutAlgorithm, options: SectionsOptions): LayoutAlgorithm => ({
  name: `sections(${inner.name})`,
  capabilities: {
    incremental: false,
    requiresMeasuredHeight: inner.capabilities.requiresMeasuredHeight,
  },
  layout(items: readonly LayoutItem[], context: LayoutContext): LayoutResult {
    const { viewport, gap, measurements } = context
    const sectionGap = options.sectionGap ?? gap.y
    const builder = positionsBuilder(items.length)
    let top = 0

    for (const run of runsOf(items, options.isHeader)) {
      const header = run.header === NO_HEADER ? undefined : items[run.header]
      if (header !== undefined) {
        const { height } = measurements.size(header, viewport.width)
        builder.push(header.id, 0, top, viewport.width, height)
        top += height + gap.y
      }
      if (run.end > run.start) {
        const laid = inner.layout(items.slice(run.start, run.end), context)
        const positions = laid.positions
        const xs = positions.x
        const ys = positions.y
        const ws = positions.width
        const hs = positions.height
        for (let i = 0; i < positions.count; i += 1) {
          builder.push(positions.idAt(i), xs[i] ?? 0, (ys[i] ?? 0) + top, ws[i] ?? 0, hs[i] ?? 0)
        }
        top += laid.contentSize.height
      }
      top += sectionGap
    }

    return {
      positions: builder.build(),
      contentSize: { width: viewport.width, height: Math.max(0, top - sectionGap) },
    }
  },
})
