import { DEFAULT_REACH_END_THRESHOLD } from '../constants.js'
import type { DomEnvironment, ReachEndWatcher } from '../types/index.js'
import { rafThrottle } from './raf-throttle.js'

export const createReachEndWatcher = (
  environment: DomEnvironment,
  onReachEnd: (() => void) | undefined,
  threshold: number = DEFAULT_REACH_END_THRESHOLD,
): ReachEndWatcher | undefined => {
  if (onReachEnd === undefined) {
    return undefined
  }

  const fire = rafThrottle(environment, onReachEnd)
  let firedAt: number | undefined

  return {
    check(start, size, extent) {
      if (start + size < extent - threshold) {
        firedAt = undefined
        return
      }
      if (firedAt === extent) {
        return
      }
      firedAt = extent
      fire.run()
    },
    stop: () => fire.cancel(),
  }
}
