import { describe, expect, it } from 'vitest'
import { resolveColumnCount, resolveRowCount, resolveTrackSize } from './column-count.js'

describe('resolveColumnCount', () => {
  it('takes a fixed count as given', () => {
    expect(resolveColumnCount({ columns: 5 }, 1000, 10)).toBe(5)
  })

  it('floors a fractional count and never drops below one', () => {
    expect(resolveColumnCount({ columns: 3.9 }, 1000, 10)).toBe(3)
    expect(resolveColumnCount({ columns: 0 }, 1000, 10)).toBe(1)
    expect(resolveColumnCount({ columns: -4 }, 1000, 10)).toBe(1)
    expect(resolveColumnCount({ columns: Number.NaN }, 1000, 10)).toBe(1)
  })

  it('derives the count from a target column width', () => {
    expect(resolveColumnCount({ columnWidth: 240 }, 1000, 10)).toBe(4)
  })

  it('caps a derived count with maxColumns', () => {
    expect(resolveColumnCount({ columnWidth: 100, maxColumns: 5 }, 1000, 10)).toBe(5)
  })
})

describe('resolveColumnCount with breakpoints', () => {
  const breakpoints = { 0: 1, 520: 2, 900: 3, 1400: 5 }

  it('picks the entry for the current container width', () => {
    expect(resolveColumnCount({ columns: breakpoints }, 400, 10)).toBe(1)
    expect(resolveColumnCount({ columns: breakpoints }, 700, 10)).toBe(2)
    expect(resolveColumnCount({ columns: breakpoints }, 1200, 10)).toBe(3)
    expect(resolveColumnCount({ columns: breakpoints }, 1800, 10)).toBe(5)
  })

  it('treats a breakpoint as inclusive at its exact width', () => {
    expect(resolveColumnCount({ columns: breakpoints }, 520, 10)).toBe(2)
  })

  it('does not care what order the entries are written in', () => {
    expect(resolveColumnCount({ columns: { 1400: 5, 0: 1, 900: 3, 520: 2 } }, 1000, 10)).toBe(3)
  })

  it('falls back to the smallest entry below the first breakpoint', () => {
    expect(resolveColumnCount({ columns: { 768: 3, 1200: 4 } }, 320, 10)).toBe(3)
  })

  it('clamps the value an entry declares', () => {
    expect(resolveColumnCount({ columns: { 0: 0 } }, 800, 10)).toBe(1)
    expect(resolveColumnCount({ columns: { 0: 4.8 } }, 800, 10)).toBe(4)
  })

  it('ignores entries whose key is not a finite width', () => {
    expect(resolveColumnCount({ columns: { 0: 2, nope: 9 } as never }, 800, 10)).toBe(2)
  })

  it('falls through to the target width when the map is empty', () => {
    expect(resolveColumnCount({ columns: {}, columnWidth: 240 }, 1000, 10)).toBe(4)
  })

  it('falls through to the default when there is nothing else to go on', () => {
    expect(resolveColumnCount({ columns: {} }, 1000, 10)).toBe(1)
  })
})

describe('resolveRowCount', () => {
  it('reads breakpoints against the container height', () => {
    const rows = { 0: 1, 600: 2, 1000: 4 }

    expect(resolveRowCount({ rows }, 400, 8)).toBe(1)
    expect(resolveRowCount({ rows }, 800, 8)).toBe(2)
    expect(resolveRowCount({ rows }, 1400, 8)).toBe(4)
  })

  it('still accepts a fixed count and a target row height', () => {
    expect(resolveRowCount({ rows: 3 }, 900, 8)).toBe(3)
    expect(resolveRowCount({ rowHeight: 200 }, 832, 8)).toBe(4)
  })
})

describe('resolveTrackSize', () => {
  it('divides the extent after removing the gaps between tracks', () => {
    expect(resolveTrackSize(1000, 4, 10)).toBe(242.5)
  })

  it('never returns a negative size when the gaps exceed the extent', () => {
    expect(resolveTrackSize(0, 4, 12)).toBe(0)
  })
})
