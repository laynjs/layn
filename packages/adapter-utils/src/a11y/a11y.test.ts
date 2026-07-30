import { describe, expect, it } from 'vitest'
import { containerAria, containerAttrs, contentAria, itemAria } from './a11y.js'

describe('itemAria', () => {
  it('advertises the full set size and one-based position for virtualized items', () => {
    expect(itemAria(0, 160)).toEqual({
      role: 'listitem',
      'aria-setsize': 160,
      'aria-posinset': 1,
    })
    expect(itemAria(41, 160)['aria-posinset']).toBe(42)
  })
})

describe('contentAria', () => {
  it('marks the content wrapper as the list that owns the items', () => {
    expect(contentAria()).toEqual({ role: 'list' })
  })
})

describe('containerAria', () => {
  it('is empty without a label so an unlabeled region is not announced', () => {
    expect(containerAria(undefined)).toEqual({})
  })

  it('exposes a labeled region when a label is provided', () => {
    expect(containerAria('Photos')).toEqual({ role: 'region', 'aria-label': 'Photos' })
  })
})

describe('containerAttrs', () => {
  it('keeps the scroll container keyboard-focusable even without a label', () => {
    expect(containerAttrs(undefined)).toEqual({ tabindex: 0 })
  })

  it('adds the labeled region attributes alongside the tab index', () => {
    expect(containerAttrs('Photos')).toEqual({
      tabindex: 0,
      role: 'region',
      'aria-label': 'Photos',
    })
  })
})
