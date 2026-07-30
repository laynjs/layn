import type { DomEnvironment } from '../types/index.js'

export const rafThrottle = (environment: DomEnvironment, callback: () => void) => {
  let handle: number | undefined

  return {
    run(): void {
      if (handle !== undefined) {
        return
      }
      handle = environment.requestAnimationFrame(() => {
        handle = undefined
        callback()
      })
    },
    cancel(): void {
      if (handle !== undefined) {
        environment.cancelAnimationFrame(handle)
        handle = undefined
      }
    },
  }
}
