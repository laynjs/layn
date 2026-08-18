import { createEngine, masonry } from '@laynjs/core'
import { describe, expect, it } from 'vitest'
import {
  DEVTOOLS_ESTIMATED_COLOR,
  DEVTOOLS_MEASURED_COLOR,
  DEVTOOLS_OVERSCAN_COLOR,
} from '../constants.js'
import type { DevtoolsFrame } from '../types/index.js'
import { paint } from './draw.js'

const recorder = () => {
  const strokes: Array<{ color: string; rect: number[] }> = []
  const fills: string[] = []
  const texts: string[] = []
  const dashes: number[][] = []
  let strokeStyle = ''
  let fillStyle = ''

  const context = {
    get strokeStyle() {
      return strokeStyle
    },
    set strokeStyle(value: string) {
      strokeStyle = value
    },
    get fillStyle() {
      return fillStyle
    },
    set fillStyle(value: string) {
      fillStyle = value
    },
    font: '',
    lineWidth: 0,
    textBaseline: '',
    clearRect: () => undefined,
    strokeRect: (x: number, y: number, w: number, h: number) => {
      strokes.push({ color: strokeStyle, rect: [x, y, w, h] })
    },
    fillRect: () => {
      fills.push(fillStyle)
    },
    fillText: (text: string) => {
      texts.push(text)
    },
    measureText: (text: string) => ({ width: text.length * 6 }),
    save: () => undefined,
    restore: () => undefined,
    beginPath: () => undefined,
    moveTo: () => undefined,
    lineTo: () => undefined,
    stroke: () => undefined,
    setLineDash: (pattern: number[]) => {
      dashes.push(pattern)
    },
  }

  return { context, strokes, fills, texts, dashes }
}

const frameOf = (overrides: Partial<DevtoolsFrame> = {}): DevtoolsFrame => ({
  total: 4,
  rendered: 4,
  measured: 2,
  start: 0,
  size: 400,
  overscan: 100,
  axis: 'vertical',
  contentWidth: 400,
  contentHeight: 1200,
  ...overrides,
})

const engineOf = () =>
  createEngine({
    algorithm: masonry({ columns: 2 }),
    gap: { x: 10, y: 10 },
    viewport: { width: 410, height: 400 },
    items: [
      { id: 'a', aspectRatio: 1 },
      { id: 'b', aspectRatio: 1 },
      { id: 'c', aspectRatio: 1 },
      { id: 'd', aspectRatio: 1 },
    ],
  })

describe('devtools painting', () => {
  it('outlines measured and estimated items in different colours', () => {
    const engine = engineOf()
    engine.measure([{ id: 'a', size: { width: 200, height: 120 } }])
    const positions = engine.getSnapshot().positions
    const { context, strokes } = recorder()

    paint(
      context as unknown as CanvasRenderingContext2D,
      positions,
      [0, 1, 2, 3],
      (index) => engine.isMeasured(positions.idAt(index)),
      frameOf(),
      0,
      0,
      410,
      400,
    )

    const item = strokes.slice(0, 4)
    expect(item[0]?.color).toBe(DEVTOOLS_MEASURED_COLOR)
    expect(item[1]?.color).toBe(DEVTOOLS_ESTIMATED_COLOR)
    expect(item.filter((entry) => entry.color === DEVTOOLS_ESTIMATED_COLOR)).toHaveLength(3)
  })

  it('offsets rectangles by the scroll position', () => {
    const engine = engineOf()
    const positions = engine.getSnapshot().positions
    const plain = recorder()
    const scrolled = recorder()

    const run = (context: ReturnType<typeof recorder>, offsetY: number) => {
      paint(
        context.context as unknown as CanvasRenderingContext2D,
        positions,
        [0],
        () => false,
        frameOf({ start: offsetY }),
        0,
        offsetY,
        410,
        400,
      )
    }

    run(plain, 0)
    run(scrolled, 250)

    expect((plain.strokes[0]?.rect[1] ?? 0) - (scrolled.strokes[0]?.rect[1] ?? 0)).toBe(250)
  })

  it('draws the overscan band and the readout', () => {
    const engine = engineOf()
    const { context, dashes, texts, strokes } = recorder()

    paint(
      context as unknown as CanvasRenderingContext2D,
      engine.getSnapshot().positions,
      [],
      () => false,
      frameOf({ rendered: 0, measured: 0 }),
      0,
      0,
      410,
      400,
    )

    expect(dashes).toHaveLength(1)
    expect(strokes.some((entry) => entry.color === DEVTOOLS_OVERSCAN_COLOR)).toBe(true)
    expect(texts.some((line) => line.startsWith('items'))).toBe(true)
    expect(texts.some((line) => line.includes('overscan   100px'))).toBe(true)
  })

  it('skips the overscan band when there is none', () => {
    const engine = engineOf()
    const { context, dashes } = recorder()

    paint(
      context as unknown as CanvasRenderingContext2D,
      engine.getSnapshot().positions,
      [],
      () => false,
      frameOf({ overscan: 0 }),
      0,
      0,
      410,
      400,
    )

    expect(dashes).toHaveLength(0)
  })
})
