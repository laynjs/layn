import { describe, expect, it } from 'vitest'
import { resolveBindTargets } from './targets.js'

const view = { name: 'window' }
const element = { ownerDocument: { defaultView: view } } as unknown as HTMLElement
const detached = { ownerDocument: { defaultView: null } } as unknown as HTMLElement

describe('resolveBindTargets', () => {
  it('scrolls the container by default', () => {
    expect(resolveBindTargets(undefined, element)).toEqual({ scroll: element })
    expect(resolveBindTargets('container', element)).toEqual({ scroll: element })
  })

  it('scrolls the window with the container as origin', () => {
    expect(resolveBindTargets('window', element)).toEqual({ scroll: view, origin: element })
  })

  it('falls back to the container when no window is reachable', () => {
    expect(resolveBindTargets('window', detached)).toEqual({ scroll: detached })
  })
})
