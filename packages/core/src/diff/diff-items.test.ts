import { describe, expect, it } from 'vitest'
import type { LayoutItem } from '../types/index.js'
import { diffItems } from './diff-items.js'

const items = (...ids: number[]): LayoutItem[] => ids.map((id) => ({ id, aspectRatio: 1 }))

describe('diffItems', () => {
  it('reports identical lists', () => {
    expect(diffItems(items(1, 2, 3), items(1, 2, 3))).toEqual({
      kind: 'identical',
      commonPrefix: 3,
      commonSuffix: 0,
      addedCount: 0,
      removedCount: 0,
    })
  })

  it('detects a pure append', () => {
    expect(diffItems(items(1, 2), items(1, 2, 3, 4))).toMatchObject({
      kind: 'append',
      commonPrefix: 2,
      addedCount: 2,
      removedCount: 0,
    })
  })

  it('appends onto an empty list', () => {
    expect(diffItems(items(), items(1, 2))).toMatchObject({ kind: 'append', commonPrefix: 0 })
  })

  it('detects a pure prepend', () => {
    expect(diffItems(items(3, 4), items(1, 2, 3, 4))).toEqual({
      kind: 'prepend',
      commonPrefix: 0,
      commonSuffix: 2,
      addedCount: 2,
      removedCount: 0,
    })
  })

  it('detects an insert in the middle', () => {
    expect(diffItems(items(1, 2, 5), items(1, 2, 3, 4, 5))).toEqual({
      kind: 'insert',
      commonPrefix: 2,
      commonSuffix: 1,
      addedCount: 2,
      removedCount: 0,
    })
  })

  it('detects a removal from the middle', () => {
    expect(diffItems(items(1, 2, 3, 4), items(1, 4))).toEqual({
      kind: 'remove',
      commonPrefix: 1,
      commonSuffix: 1,
      addedCount: 0,
      removedCount: 2,
    })
  })

  it('detects a truncating removal', () => {
    expect(diffItems(items(1, 2, 3), items(1, 2))).toMatchObject({
      kind: 'remove',
      commonPrefix: 2,
      commonSuffix: 0,
      removedCount: 1,
    })
  })

  it('detects a removal from the head', () => {
    expect(diffItems(items(1, 2, 3), items(2, 3))).toMatchObject({
      kind: 'remove',
      commonPrefix: 0,
      commonSuffix: 2,
      removedCount: 1,
    })
  })

  it('reports an emptied list as a removal', () => {
    expect(diffItems(items(1, 2), items())).toMatchObject({ kind: 'remove', removedCount: 2 })
  })

  it('treats a changed sizing field as a replace', () => {
    const before: LayoutItem[] = [{ id: 1, aspectRatio: 1 }]
    const after: LayoutItem[] = [{ id: 1, aspectRatio: 2 }]

    expect(diffItems(before, after)).toMatchObject({
      kind: 'replace',
      commonPrefix: 0,
      addedCount: 1,
      removedCount: 1,
    })
  })

  it('ignores non-layout data when comparing', () => {
    const before: LayoutItem[] = [{ id: 1, aspectRatio: 1, data: 'a' }]
    const after: LayoutItem[] = [{ id: 1, aspectRatio: 1, data: 'b' }]

    expect(diffItems(before, after)).toMatchObject({ kind: 'identical', commonPrefix: 1 })
  })

  it('treats a reorder as a replace and reports the shared edges', () => {
    expect(diffItems(items(1, 2, 3, 4), items(1, 3, 2, 4))).toEqual({
      kind: 'replace',
      commonPrefix: 1,
      commonSuffix: 1,
      addedCount: 2,
      removedCount: 2,
    })
  })

  it('never counts an item in both the prefix and the suffix', () => {
    expect(diffItems(items(1, 2), items(1, 2, 1, 2))).toMatchObject({
      kind: 'append',
      commonPrefix: 2,
      commonSuffix: 0,
      addedCount: 2,
      removedCount: 0,
    })
  })
})
