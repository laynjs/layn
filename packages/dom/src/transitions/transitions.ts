import type { ItemId } from '@laynjs/core'
import {
  DEFAULT_TRANSITION_DURATION,
  DEFAULT_TRANSITION_EASING,
  TRANSITION_ENTER_RISE,
  TRANSITION_EPSILON,
} from '../constants.js'
import type {
  AnimateOption,
  DomEnvironment,
  TransitionConfig,
  TransitionRunner,
} from '../types/index.js'
import type { TransitionBatch, TransitionEnter, TransitionMove, TransitionPlan } from './types.js'

export const resolveTransitionConfig = (
  animate: AnimateOption | undefined,
): TransitionConfig | undefined => {
  if (animate === undefined || animate === false) {
    return undefined
  }
  if (animate === true) {
    return { duration: DEFAULT_TRANSITION_DURATION, easing: DEFAULT_TRANSITION_EASING }
  }
  return {
    duration: animate.duration ?? DEFAULT_TRANSITION_DURATION,
    easing: animate.easing ?? DEFAULT_TRANSITION_EASING,
  }
}

export const createTransitionRunner = (
  environment: DomEnvironment,
  animate: AnimateOption | undefined,
): TransitionRunner | undefined => {
  const config = resolveTransitionConfig(animate)
  if (config === undefined) {
    return undefined
  }

  const animations = new Map<ItemId, Animation>()
  const fades = new Set<Animation>()
  let frame: number | undefined
  let pending: TransitionBatch | undefined

  const collect = (batch: TransitionBatch): TransitionPlan => {
    const moves: TransitionMove[] = []
    const enters: TransitionEnter[] = []
    for (const index of batch.visible) {
      const id = batch.next.idAt(index)
      const element = batch.elementOf(id)
      if (element === undefined) {
        continue
      }
      const from = batch.previous.rectOf(id)
      if (from === undefined) {
        enters.push({ id, element })
        continue
      }
      const to = batch.next.rectAt(index)
      let offsetX = 0
      let offsetY = 0
      if (animations.has(id)) {
        const combined = environment.readTransform(element)
        offsetX = combined.x - to.x
        offsetY = combined.y - to.y
      }
      const dx = from.x - to.x + offsetX
      const dy = from.y - to.y + offsetY
      if (Math.abs(dx) < TRANSITION_EPSILON && Math.abs(dy) < TRANSITION_EPSILON) {
        continue
      }
      moves.push({ id, element, dx, dy })
    }
    return { moves, enters }
  }

  const start = (move: TransitionMove): void => {
    animations.get(move.id)?.cancel()
    const animation = move.element.animate(
      [
        { transform: `translate(${move.dx}px, ${move.dy}px)` },
        { transform: 'translate(0px, 0px)' },
      ],
      { duration: config.duration, easing: config.easing, composite: 'add' },
    )
    animation.onfinish = () => {
      if (animations.get(move.id) === animation) {
        animations.delete(move.id)
      }
    }
    animations.set(move.id, animation)
  }

  const enter = (entry: TransitionEnter): void => {
    animations.get(entry.id)?.cancel()
    const rise = entry.element.animate(
      [
        { transform: `translate(0px, ${TRANSITION_ENTER_RISE}px)` },
        { transform: 'translate(0px, 0px)' },
      ],
      { duration: config.duration, easing: config.easing, composite: 'add' },
    )
    rise.onfinish = () => {
      if (animations.get(entry.id) === rise) {
        animations.delete(entry.id)
      }
    }
    animations.set(entry.id, rise)
    const fade = entry.element.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: config.duration,
      easing: config.easing,
    })
    fade.onfinish = () => {
      fades.delete(fade)
    }
    fades.add(fade)
  }

  const run = (): void => {
    frame = undefined
    const batch = pending
    pending = undefined
    if (batch === undefined) {
      return
    }
    const plan = collect(batch)
    for (const move of plan.moves) {
      start(move)
    }
    for (const entry of plan.enters) {
      enter(entry)
    }
  }

  return {
    play(previous, next, elementOf, visible) {
      pending = { previous: pending?.previous ?? previous, next, elementOf, visible }
      if (frame === undefined) {
        frame = environment.requestAnimationFrame(run)
      }
    },
    stop() {
      if (frame !== undefined) {
        environment.cancelAnimationFrame(frame)
        frame = undefined
      }
      pending = undefined
      for (const animation of animations.values()) {
        animation.cancel()
      }
      animations.clear()
      for (const fade of fades) {
        fade.cancel()
      }
      fades.clear()
    },
  }
}
