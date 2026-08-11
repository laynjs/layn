import { describe, expect, it } from 'vitest'
import { blockSpan, resolveSpan } from './span.js'

describe('resolveSpan', () => {
  it('clamps to the track count so a span can never overflow the container', () => {
    expect(resolveSpan(9, 3)).toBe(3)
  })

  it('clamps a zero or negative span up to one', () => {
    expect(resolveSpan(0, 4)).toBe(1)
    expect(resolveSpan(-2, 4)).toBe(1)
  })

  it('floors a fractional span', () => {
    expect(resolveSpan(2.9, 4)).toBe(2)
  })

  it('treats a meaningless span as one but keeps an unbounded one monotone', () => {
    expect(resolveSpan(Number.NaN, 4)).toBe(1)
    expect(resolveSpan(Number.POSITIVE_INFINITY, 4)).toBe(4)
    expect(resolveSpan(Number.NEGATIVE_INFINITY, 4)).toBe(1)
  })
})

describe('blockSpan', () => {
  it('makes a square block of cells', () => {
    expect(blockSpan(2, 4)).toEqual([2, 2])
  })

  it('stays square after clamping', () => {
    expect(blockSpan(9, 3)).toEqual([3, 3])
  })
})
