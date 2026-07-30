import type { MeasuredEntry } from '@laynjs/core'
import { describe, expect, it } from 'vitest'
import { createControlledEnvironment, FakeElement } from '../__fixtures__/dom.js'
import { createSizeObserver } from './size-observer.js'

const asTarget = (element: FakeElement): Element => element as unknown as Element

describe('size observer', () => {
  it('reports measured entries for observed elements', () => {
    const { environment, observers } = createControlledEnvironment()
    const batches: MeasuredEntry[][] = []
    const observer = createSizeObserver(environment, (entries) => batches.push([...entries]))

    const element = asTarget(new FakeElement())
    observer.observe(1, element)
    observers[0]?.trigger([{ target: element, contentRect: { width: 100, height: 220 } }])

    expect(batches).toEqual([[{ id: 1, size: { width: 100, height: 220 } }]])
  })

  it('ignores entries for elements that are no longer observed', () => {
    const { environment, observers } = createControlledEnvironment()
    const batches: MeasuredEntry[][] = []
    const observer = createSizeObserver(environment, (entries) => batches.push([...entries]))

    const element = asTarget(new FakeElement())
    observer.observe(1, element)
    observer.unobserve(1)
    observers[0]?.trigger([{ target: element, contentRect: { width: 100, height: 220 } }])

    expect(batches).toEqual([])
  })
})
