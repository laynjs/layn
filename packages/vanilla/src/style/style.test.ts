import { describe, expect, it } from 'vitest'
import { contentStyleString, rectStyleString } from './style.js'

describe('style strings', () => {
  it('formats an absolute item rect with a px translate', () => {
    expect(rectStyleString({ x: 12, y: 34, width: 100, height: 200 })).toBe(
      'position:absolute;top:0;left:0;width:100px;height:200px;transform:translate(12px, 34px)',
    )
  })

  it('formats the relative content box from the content size', () => {
    expect(contentStyleString({ width: 640, height: 4800 })).toBe(
      'position:relative;width:640px;height:4800px',
    )
  })
})
