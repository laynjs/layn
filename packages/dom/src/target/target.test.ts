import { describe, expect, it } from 'vitest'
import { asElement, FakeElement } from '../__fixtures__/dom.js'
import { isElement, readOrigin, readScrollWindow, readViewportSize } from './target.js'

const fakeWindow = (props: {
  scrollX: number
  scrollY: number
  innerWidth: number
  innerHeight: number
}): Window => props as unknown as Window

describe('target', () => {
  it('reads a vertical scroll window from an element', () => {
    const element = new FakeElement()
    element.scrollTop = 100
    element.clientHeight = 500

    expect(readScrollWindow(asElement(element), 'vertical')).toEqual({ start: 100, size: 500 })
  })

  it('reads a horizontal scroll window from an element', () => {
    const element = new FakeElement()
    element.scrollLeft = 40
    element.clientWidth = 250

    expect(readScrollWindow(asElement(element), 'horizontal')).toEqual({ start: 40, size: 250 })
  })

  it('reads a scroll window from the window', () => {
    const target = fakeWindow({ scrollX: 0, scrollY: 50, innerWidth: 400, innerHeight: 800 })

    expect(readScrollWindow(target, 'vertical')).toEqual({ start: 50, size: 800 })
    expect(isElement(target)).toBe(false)
  })

  it('subtracts the origin offset from a window scroll window', () => {
    const target = fakeWindow({ scrollX: 30, scrollY: 500, innerWidth: 400, innerHeight: 800 })

    expect(readScrollWindow(target, 'vertical', 300)).toEqual({ start: 200, size: 800 })
    expect(readScrollWindow(target, 'horizontal', 10)).toEqual({ start: 20, size: 400 })
  })

  it('resolves the origin offset as the element document position, zero for element targets', () => {
    const origin = new FakeElement()
    origin.rect = { top: 120, left: 40, width: 0, height: 0 }
    const target = fakeWindow({ scrollX: 15, scrollY: 200, innerWidth: 400, innerHeight: 800 })

    expect(readOrigin(asElement(origin), target, 'vertical')).toBe(320)
    expect(readOrigin(asElement(origin), target, 'horizontal')).toBe(55)
    expect(readOrigin(undefined, target, 'vertical')).toBe(0)
    expect(readOrigin(asElement(origin), asElement(new FakeElement()), 'vertical')).toBe(0)
  })

  it('reads the viewport size from either target', () => {
    const element = new FakeElement()
    element.clientWidth = 320
    element.clientHeight = 600

    expect(readViewportSize(asElement(element))).toEqual({ width: 320, height: 600 })
    expect(
      readViewportSize(fakeWindow({ scrollX: 0, scrollY: 0, innerWidth: 375, innerHeight: 812 })),
    ).toEqual({ width: 375, height: 812 })
  })
})
