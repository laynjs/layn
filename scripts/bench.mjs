import {
  binPacking,
  columns,
  createEngine,
  createMeasurements,
  horizontalMasonry,
  justified,
  magazine,
  masonry,
  packing,
  quilt,
  sections,
  staggered,
} from '../packages/core/dist/index.js'
import { createStickyHeaders } from '../packages/dom/dist/sticky/sticky-headers.js'

const measurements = createMeasurements()
const viewport = { width: 1200, height: 800 }
const gap = { x: 12, y: 12 }
const context = { viewport, gap, measurements }

const ratio = (i) => 0.6 + ((i * 2654435761) % 1000) / 1000
const makeItems = (n) => Array.from({ length: n }, (_, i) => ({ id: i, aspectRatio: ratio(i) }))

const isHeader = (item) => item.id % 100 === 0
const makeGrouped = (n) =>
  Array.from({ length: n }, (_, i) =>
    i % 100 === 0 ? { id: i, height: 48 } : { id: i, aspectRatio: ratio(i) },
  )

const algos = {
  masonry: masonry({ columns: 5 }),
  columns: columns({ columns: 5 }),
  'horizontal-masonry': horizontalMasonry({ rows: 5 }),
  justified: justified({ targetRowHeight: 220 }),
  staggered: staggered({ columns: 5 }),
  packing: packing({ baseSize: 180 }),
  'bin-packing': binPacking({ baseSize: 180 }),
  quilt: quilt({ columns: 5 }),
  magazine: magazine({ rowHeight: 240 }),
}

const time = (fn) => {
  const t0 = process.hrtime.bigint()
  fn()
  return Number(process.hrtime.bigint() - t0) / 1e6
}

const best = (runs, fn) => {
  fn()
  let fastest = Number.POSITIVE_INFINITY
  for (let r = 0; r < runs; r += 1) {
    fastest = Math.min(fastest, time(fn))
  }
  return fastest
}

const ms = (value) => `${value < 1 ? value.toFixed(2) : value.toFixed(1)}ms`
const sizes = [1000, 5000, 10000, 50000]

console.log('Full layout time per algorithm (best of 5, 3 at 50k)\n')
console.log(['algorithm'.padEnd(20), ...sizes.map((s) => `${s}`.padStart(10))].join(''))

for (const [name, algo] of Object.entries(algos)) {
  const row = [name.padEnd(20)]
  for (const n of sizes) {
    const items = makeItems(n)
    row.push(ms(best(n >= 50000 ? 3 : 5, () => algo.layout(items, context))).padStart(10))
  }
  console.log(row.join(''))
}

const grouped = makeGrouped(50000)
const plain = makeItems(50000)
const inner = masonry({ columns: 5 })
const grouping = sections(inner, { isHeader })
const flat = best(3, () => inner.layout(plain, context))
const stacked = best(3, () => grouping.layout(grouped, context))

console.log('\nSections overhead at 50k items (500 groups)\n')
console.log(`  masonry              ${ms(flat)}`)
console.log(`  sections(masonry)    ${ms(stacked)}  (${(stacked / flat).toFixed(1)}x)`)

const collect = () => globalThis.gc?.()

collect()
const before = process.memoryUsage().heapUsed
const large = makeItems(100000)
const engine = createEngine({ algorithm: masonry({ columns: 5 }), gap, viewport, items: large })
const scrollWindow = { start: 0, size: viewport.height }
const indexBuild = time(() => engine.getVisible(scrollWindow))
collect()
const resident = (process.memoryUsage().heapUsed - before) / 1e6
const height = engine.getSnapshot().contentSize.height

const queries = best(5, () => {
  for (let i = 0; i < 1000; i += 1) {
    engine.getVisible({ start: (i / 1000) * height, size: viewport.height })
  }
})
const append = best(5, () => engine.appendItems([{ id: `extra-${Math.random()}`, aspectRatio: 1 }]))

console.log('\nEngine primitives at 100k items\n')
console.log(`  build spatial index  ${ms(indexBuild)}`)
console.log(
  `  1000 scroll queries  ${ms(queries)}  (${((queries / 1000) * 1000).toFixed(1)}us each)`,
)
console.log(`  append one item      ${ms(append)}`)
const heap = resident > 0 ? `${resident.toFixed(1)}MB` : 'unstable, re-run with --expose-gc'
console.log(`  items + index heap   ${heap}`)

const stickyItems = makeGrouped(200000)
const stickyEngine = createEngine({ algorithm: grouping, gap, viewport, items: stickyItems })
const noop = () => undefined
const fakeElement = { style: {}, setAttribute: noop, removeAttribute: noop }
const sticky = createStickyHeaders({
  engine: stickyEngine,
  isHeader,
  elementOf: () => fakeElement,
})
const stickyHeight = stickyEngine.getSnapshot().contentSize.height
const refresh = best(5, () => sticky.refresh())
const frames = best(5, () => {
  for (let i = 0; i < 10000; i += 1) {
    sticky.update((i / 10000) * stickyHeight)
  }
})

console.log('\nSticky headers with 2000 sections\n')
console.log(`  refresh (per layout) ${ms(refresh)}`)
console.log(`  update (per frame)   ${((frames / 10000) * 1000).toFixed(2)}us`)

const mem = process.memoryUsage()
console.log(`\nheap after run: ${(mem.heapUsed / 1e6).toFixed(1)}MB`)
