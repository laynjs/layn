import { describe, expect, it } from 'vitest'
import { scrollOffsetFor } from './scroll-to.js'

const rect = { x: 40, y: 500, width: 120, height: 100 }

describe('scrollOffsetFor', () => {
  it('aligns the item start with the viewport start', () => {
    expect(scrollOffsetFor(rect, 'vertical', 300, 'start')).toBe(500)
    expect(scrollOffsetFor(rect, 'horizontal', 300, 'start')).toBe(40)
  })

  it('centers the item in the viewport', () => {
    expect(scrollOffsetFor(rect, 'vertical', 300, 'center')).toBe(400)
  })

  it('aligns the item end with the viewport end', () => {
    expect(scrollOffsetFor(rect, 'vertical', 300, 'end')).toBe(300)
  })
})
