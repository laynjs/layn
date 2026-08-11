import { LaynError } from '../errors/index.js'
import type { ItemId, Positions, Rect } from '../types/index.js'
import type { PositionData, PositionsBuilder } from './types.js'

const MIN_CAPACITY = 8

const makePositions = (data: PositionData, count: number): Positions => {
  let lookup: Map<ItemId, number> | undefined

  const resolveLookup = (): Map<ItemId, number> => {
    if (lookup === undefined) {
      const next = new Map<ItemId, number>()
      for (let i = 0; i < count; i += 1) {
        const id = data.ids[i]
        if (id !== undefined) {
          next.set(id, i)
        }
      }
      lookup = next
    }
    return lookup
  }

  const rectAt = (index: number): Rect => ({
    x: data.xs[index] ?? 0,
    y: data.ys[index] ?? 0,
    width: data.ws[index] ?? 0,
    height: data.hs[index] ?? 0,
  })

  const indexOf = (id: ItemId): number => {
    const index = resolveLookup().get(id)
    return index === undefined || index >= count ? -1 : index
  }

  return {
    count,
    get x(): Float64Array {
      return data.xs.subarray(0, count)
    },
    get y(): Float64Array {
      return data.ys.subarray(0, count)
    },
    get width(): Float64Array {
      return data.ws.subarray(0, count)
    },
    get height(): Float64Array {
      return data.hs.subarray(0, count)
    },
    idAt(index: number): ItemId {
      const id = data.ids[index]
      if (id === undefined || index < 0 || index >= count) {
        throw new LaynError('OUT_OF_RANGE', `layn position index ${index} is out of range`)
      }
      return id
    },
    indexOf,
    rectAt,
    rectOf(id: ItemId): Rect | undefined {
      const index = indexOf(id)
      return index === -1 ? undefined : rectAt(index)
    },
  }
}

const growData = (data: PositionData, needed: number): void => {
  if (needed <= data.capacity) {
    return
  }
  const capacity = Math.max(needed, data.capacity * 2)
  const xs = new Float64Array(capacity)
  const ys = new Float64Array(capacity)
  const ws = new Float64Array(capacity)
  const hs = new Float64Array(capacity)
  xs.set(data.xs.subarray(0, data.count))
  ys.set(data.ys.subarray(0, data.count))
  ws.set(data.ws.subarray(0, data.count))
  hs.set(data.hs.subarray(0, data.count))
  data.xs = xs
  data.ys = ys
  data.ws = ws
  data.hs = hs
  data.capacity = capacity
}

const builderFor = (data: PositionData): PositionsBuilder => ({
  data,
  push(id, x, y, width, height) {
    if (data.count === data.capacity) {
      growData(data, data.count + 1)
    }
    const index = data.count
    data.ids[index] = id
    data.xs[index] = data.mirror === undefined ? x : data.mirror - x - width
    data.ys[index] = y
    data.ws[index] = width
    data.hs[index] = height
    data.count = index + 1
  },
  build() {
    return makePositions(data, data.count)
  },
})

export const positionsBuilder = (capacity: number, mirror?: number): PositionsBuilder => {
  const size = Math.max(MIN_CAPACITY, capacity)
  return builderFor({
    ids: [],
    xs: new Float64Array(size),
    ys: new Float64Array(size),
    ws: new Float64Array(size),
    hs: new Float64Array(size),
    count: 0,
    capacity: size,
    mirror,
  })
}

export const extendPositions = (previous: PositionData, additional: number): PositionsBuilder => {
  growData(previous, previous.count + additional)
  return builderFor(previous)
}

export const samePositions = (a: Positions, b: Positions): boolean => {
  if (a.count !== b.count) {
    return false
  }
  const { x: ax, y: ay, width: aw, height: ah } = a
  const { x: bx, y: by, width: bw, height: bh } = b
  for (let i = 0; i < a.count; i += 1) {
    if (ax[i] !== bx[i] || ay[i] !== by[i] || aw[i] !== bw[i] || ah[i] !== bh[i]) {
      return false
    }
  }
  return true
}

export const createPositions = (entries: Iterable<readonly [ItemId, Rect]>): Positions => {
  const list = [...entries]
  const builder = positionsBuilder(list.length)
  for (const [id, box] of list) {
    builder.push(id, box.x, box.y, box.width, box.height)
  }
  return builder.build()
}
