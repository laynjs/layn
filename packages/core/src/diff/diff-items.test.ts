import { describe, expect, it } from 'vitest'
import type { LayoutItem } from '../types/index.js'
import { diffItems } from './diff-items.js'

const items = (...ids: number[]): LayoutItem[] => ids.map((id) => ({ id, aspectRatio: 1 }))

describe('diffItems', () => {
  it('reports identical lists', () => {
    expect(diffItems(items(1, 2, 3), items(1, 2, 3))).toEqual({
      kind: 'identical',
      commonPrefix: 3,
    })
  })

  it('detects a pure append', () => {
    expect(diffItems(items(1, 2), items(1, 2, 3, 4))).toEqual({ kind: 'append', commonPrefix: 2 })
  })

  it('appends onto an empty list', () => {
    expect(diffItems(items(), items(1, 2))).toEqual({ kind: 'append', commonPrefix: 0 })
  })

  it('treats a changed sizing field as a replace', () => {
    const before: LayoutItem[] = [{ id: 1, aspectRatio: 1 }]
    const after: LayoutItem[] = [{ id: 1, aspectRatio: 2 }]

    expect(diffItems(before, after)).toEqual({ kind: 'replace', commonPrefix: 0 })
  })

  it('ignores non-layout data when comparing', () => {
    const before: LayoutItem[] = [{ id: 1, aspectRatio: 1, data: 'a' }]
    const after: LayoutItem[] = [{ id: 1, aspectRatio: 1, data: 'b' }]

    expect(diffItems(before, after)).toEqual({ kind: 'identical', commonPrefix: 1 })
  })

  it('treats a reorder as a replace and reports the common prefix', () => {
    expect(diffItems(items(1, 2, 3), items(1, 3, 2))).toEqual({ kind: 'replace', commonPrefix: 1 })
  })

  it('treats a removal as a replace', () => {
    expect(diffItems(items(1, 2, 3), items(1, 2))).toEqual({ kind: 'replace', commonPrefix: 2 })
  })
})
