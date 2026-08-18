import { DEVTOOLS_Z_INDEX } from '../constants.js'
import { resolveEnvironment } from '../environment/index.js'
import { rafThrottle } from '../scroll/index.js'
import { readScrollWindow } from '../target/index.js'
import type { Devtools, DevtoolsFrame, DevtoolsOptions } from '../types/index.js'
import { paint } from './draw.js'

const makeCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.setAttribute('data-layn-devtools', '')
  const style = canvas.style
  style.position = 'fixed'
  style.pointerEvents = 'none'
  style.zIndex = String(DEVTOOLS_Z_INDEX)
  return canvas
}

export const createDevtools = (options: DevtoolsOptions): Devtools => {
  const environment = resolveEnvironment(options.environment)
  const engine = options.engine
  const container = options.container
  const target = options.scroll ?? container
  const axis = options.axis ?? 'vertical'
  const overscan = options.overscan ?? 0

  const canvas = makeCanvas()
  let attached = false
  let disposed = false

  const draw = (): void => {
    if (!attached || disposed) {
      return
    }
    const box = container.getBoundingClientRect()
    const ratio = window.devicePixelRatio || 1
    const width = Math.max(1, Math.round(box.width))
    const height = Math.max(1, Math.round(box.height))

    canvas.style.left = `${box.left}px`
    canvas.style.top = `${box.top}px`
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)

    const context = canvas.getContext('2d')
    if (context === null) {
      return
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0)

    const scroll = readScrollWindow(target, axis)
    const snapshot = engine.getSnapshot()
    const visible = engine.getVisible(scroll, { axis, overscan })
    const positions = snapshot.positions

    let measured = 0
    for (const index of visible) {
      if (engine.isMeasured(positions.idAt(index))) {
        measured += 1
      }
    }

    const frame: DevtoolsFrame = {
      total: snapshot.items.length,
      rendered: visible.length,
      measured,
      start: scroll.start,
      size: scroll.size,
      overscan,
      axis,
      contentWidth: snapshot.contentSize.width,
      contentHeight: snapshot.contentSize.height,
    }

    paint(
      context,
      positions,
      visible,
      (index) => engine.isMeasured(positions.idAt(index)),
      frame,
      axis === 'horizontal' ? scroll.start : 0,
      axis === 'vertical' ? scroll.start : 0,
      width,
      height,
    )
  }

  const throttled = rafThrottle(environment, draw)
  const schedule = (): void => {
    throttled.run()
  }
  const unsubscribe = engine.subscribe(schedule)
  const events: EventTarget = target

  const listen = (): void => {
    events.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true })
  }

  const unlisten = (): void => {
    events.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    window.removeEventListener('scroll', schedule)
  }

  return {
    show() {
      if (attached || disposed) {
        return
      }
      attached = true
      document.body.appendChild(canvas)
      listen()
      draw()
    },
    hide() {
      if (!attached) {
        return
      }
      attached = false
      unlisten()
      canvas.remove()
    },
    toggle() {
      if (attached) {
        this.hide()
      } else {
        this.show()
      }
      return attached
    },
    refresh: schedule,
    destroy() {
      disposed = true
      this.hide()
      unsubscribe()
      throttled.cancel()
    },
  }
}
