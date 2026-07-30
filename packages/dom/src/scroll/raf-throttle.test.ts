import { describe, expect, it, vi } from 'vitest'
import { createControlledEnvironment } from '../__fixtures__/dom.js'
import { rafThrottle } from './raf-throttle.js'

describe('rafThrottle', () => {
  it('coalesces multiple runs into a single frame', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const callback = vi.fn()
    const throttled = rafThrottle(environment, callback)

    throttled.run()
    throttled.run()
    throttled.run()
    expect(callback).not.toHaveBeenCalled()

    flushRaf()
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('schedules again after a frame flushes', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const callback = vi.fn()
    const throttled = rafThrottle(environment, callback)

    throttled.run()
    flushRaf()
    throttled.run()
    flushRaf()

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('does not fire a cancelled frame', () => {
    const { environment, flushRaf } = createControlledEnvironment()
    const callback = vi.fn()
    const throttled = rafThrottle(environment, callback)

    throttled.run()
    throttled.cancel()
    flushRaf()

    expect(callback).not.toHaveBeenCalled()
  })
})
