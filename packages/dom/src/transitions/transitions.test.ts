import {
  createEngine,
  type ItemId,
  type LayoutEngine,
  type LayoutItem,
  masonry,
} from '@laynjs/core'
import { describe, expect, it } from 'vitest'
import { createControlledEnvironment, FakeElement } from '../__fixtures__/dom.js'
import { DEFAULT_TRANSITION_DURATION, DEFAULT_TRANSITION_EASING } from '../constants.js'
import { createTransitionRunner, resolveTransitionConfig } from './transitions.js'

const squares = (count: number): LayoutItem[] =>
  Array.from({ length: count }, (_, index) => ({ id: index, aspectRatio: 1 }))

const engineOf = (count: number): LayoutEngine =>
  createEngine({
    algorithm: masonry({ columns: 1 }),
    items: squares(count),
    viewport: { width: 100, height: 300 },
  })

const registry = (
  count: number,
): { elements: FakeElement[]; elementOf: (id: ItemId) => Element | undefined } => {
  const elements = Array.from({ length: count }, () => new FakeElement())
  return {
    elements,
    elementOf: (id) => elements[id as number] as unknown as Element | undefined,
  }
}

describe('resolveTransitionConfig', () => {
  it('resolves defaults and merges partial options', () => {
    expect(resolveTransitionConfig(undefined)).toBeUndefined()
    expect(resolveTransitionConfig(false)).toBeUndefined()
    expect(resolveTransitionConfig(true)).toEqual({
      duration: DEFAULT_TRANSITION_DURATION,
      easing: DEFAULT_TRANSITION_EASING,
    })
    expect(resolveTransitionConfig({ duration: 120 })).toEqual({
      duration: 120,
      easing: DEFAULT_TRANSITION_EASING,
    })
  })
})

describe('createTransitionRunner', () => {
  it('returns undefined when animation is disabled', () => {
    const { environment } = createControlledEnvironment()
    expect(createTransitionRunner(environment, undefined)).toBeUndefined()
    expect(createTransitionRunner(environment, false)).toBeUndefined()
  })

  it('animates moved visible items from data-driven deltas', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const runner = createTransitionRunner(environment, true)
    const engine = engineOf(3)
    const { elements, elementOf } = registry(3)
    const previous = engine.getSnapshot().positions

    engine.setGap({ x: 0, y: 10 })
    runner?.play(previous, engine.getSnapshot().positions, elementOf, [0, 1, 2])
    flushRaf()

    expect(elements[0]?.animations).toHaveLength(0)
    expect(elements[1]?.animations[0]?.keyframes).toEqual([
      { transform: 'translate(0px, -10px)' },
      { transform: 'translate(0px, 0px)' },
    ])
    expect(elements[2]?.animations[0]?.keyframes[0]).toEqual({ transform: 'translate(0px, -20px)' })
    expect(elements[1]?.animations[0]?.options).toEqual({
      duration: DEFAULT_TRANSITION_DURATION,
      easing: DEFAULT_TRANSITION_EASING,
      composite: 'add',
    })
  })

  it('honors custom duration and easing', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const runner = createTransitionRunner(environment, { duration: 120, easing: 'linear' })
    const engine = engineOf(2)
    const { elements, elementOf } = registry(2)
    const previous = engine.getSnapshot().positions

    engine.setGap({ x: 0, y: 10 })
    runner?.play(previous, engine.getSnapshot().positions, elementOf, [0, 1])
    flushRaf()

    expect(elements[1]?.animations[0]?.options).toEqual({
      duration: 120,
      easing: 'linear',
      composite: 'add',
    })
  })

  it('coalesces same-frame commits and animates from the first previous layout', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const runner = createTransitionRunner(environment, true)
    const engine = engineOf(2)
    const { elements, elementOf } = registry(2)
    const first = engine.getSnapshot().positions

    engine.setGap({ x: 0, y: 10 })
    const second = engine.getSnapshot().positions
    runner?.play(first, second, elementOf, [0, 1])
    engine.setGap({ x: 0, y: 30 })
    runner?.play(second, engine.getSnapshot().positions, elementOf, [0, 1])
    flushRaf()

    expect(elements[1]?.animations).toHaveLength(1)
    expect(elements[1]?.animations[0]?.keyframes[0]).toEqual({ transform: 'translate(0px, -30px)' })
  })

  it('continues an interrupted animation from its current visual offset', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const runner = createTransitionRunner(environment, true)
    const engine = engineOf(2)
    const { elements, elementOf } = registry(2)
    const first = engine.getSnapshot().positions

    engine.setGap({ x: 0, y: 10 })
    const second = engine.getSnapshot().positions
    runner?.play(first, second, elementOf, [0, 1])
    flushRaf()

    const element = elements[1]
    if (element === undefined) {
      throw new Error('missing element')
    }
    element.transform = { x: 0, y: 125 }
    engine.setGap({ x: 0, y: 30 })
    runner?.play(second, engine.getSnapshot().positions, elementOf, [0, 1])
    flushRaf()

    expect(element.animations[0]?.canceled).toBe(true)
    expect(element.animations[1]?.keyframes[0]).toEqual({ transform: 'translate(0px, -25px)' })
  })

  it('ignores the stored offset once an animation has finished', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const runner = createTransitionRunner(environment, true)
    const engine = engineOf(2)
    const { elements, elementOf } = registry(2)
    const first = engine.getSnapshot().positions

    engine.setGap({ x: 0, y: 10 })
    const second = engine.getSnapshot().positions
    runner?.play(first, second, elementOf, [0, 1])
    flushRaf()

    const element = elements[1]
    if (element === undefined) {
      throw new Error('missing element')
    }
    element.animations[0]?.finish()
    element.transform = { x: 999, y: 999 }
    engine.setGap({ x: 0, y: 30 })
    runner?.play(second, engine.getSnapshot().positions, elementOf, [0, 1])
    flushRaf()

    expect(element.animations[0]?.canceled).toBe(false)
    expect(element.animations[1]?.keyframes[0]).toEqual({ transform: 'translate(0px, -20px)' })
  })

  it('skips items without an element or without a previous rect', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const runner = createTransitionRunner(environment, true)
    const engine = engineOf(2)
    const { elements, elementOf } = registry(3)
    const previous = engine.getSnapshot().positions

    engine.appendItems([{ id: 2, aspectRatio: 1 }])
    engine.setGap({ x: 0, y: 10 })
    const skipFirst = (id: ItemId): Element | undefined => (id === 0 ? undefined : elementOf(id))
    runner?.play(previous, engine.getSnapshot().positions, skipFirst, [0, 1, 2])
    flushRaf()

    expect(elements[0]?.animations).toHaveLength(0)
    expect(elements[1]?.animations).toHaveLength(1)
    expect(elements[2]?.animations).toHaveLength(0)
  })

  it('stop cancels the pending frame and every active animation', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const runner = createTransitionRunner(environment, true)
    const engine = engineOf(2)
    const { elements, elementOf } = registry(2)
    const first = engine.getSnapshot().positions

    engine.setGap({ x: 0, y: 10 })
    const second = engine.getSnapshot().positions
    runner?.play(first, second, elementOf, [0, 1])
    flushRaf()

    engine.setGap({ x: 0, y: 30 })
    runner?.play(second, engine.getSnapshot().positions, elementOf, [0, 1])
    runner?.stop()
    flushRaf()

    expect(elements[1]?.animations).toHaveLength(1)
    expect(elements[1]?.animations[0]?.canceled).toBe(true)
  })
})
