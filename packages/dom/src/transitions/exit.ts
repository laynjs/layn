import type { Positions } from '@laynjs/core'
import { CLONED_ITEM_ATTRS, EXIT_ATTR, TRANSITION_ENTER_RISE } from '../constants.js'
import type { ExitCandidate, TransitionConfig } from '../types/index.js'
import type { ExitRunner } from './types.js'

const cloneOf = (element: Element, parent: Element): HTMLElement => {
  const clone = element.cloneNode(true) as HTMLElement
  for (const attribute of CLONED_ITEM_ATTRS) {
    clone.removeAttribute(attribute)
  }
  clone.setAttribute(EXIT_ATTR, '')
  clone.setAttribute('aria-hidden', 'true')
  clone.style.pointerEvents = 'none'
  parent.appendChild(clone)
  return clone
}

export const createExitRunner = (config: TransitionConfig): ExitRunner => {
  const leaving = new Map<HTMLElement, readonly Animation[]>()

  const drop = (clone: HTMLElement): void => {
    for (const animation of leaving.get(clone) ?? []) {
      animation.cancel()
    }
    leaving.delete(clone)
    clone.remove()
  }

  const play = (clone: HTMLElement): void => {
    const timing = { duration: config.duration, easing: config.easing }
    const sink = clone.animate(
      [
        { transform: 'translate(0px, 0px)' },
        { transform: `translate(0px, ${TRANSITION_ENTER_RISE}px)` },
      ],
      { ...timing, composite: 'add' },
    )
    const fade = clone.animate([{ opacity: 1 }, { opacity: 0 }], { ...timing, fill: 'forwards' })
    leaving.set(clone, [sink, fade])
    fade.onfinish = () => drop(clone)
  }

  return {
    capture(next: Positions, leaving: Iterable<ExitCandidate>) {
      const cloned = new Set<Element>()
      for (const candidate of leaving) {
        if (next.indexOf(candidate.id) !== -1 || cloned.has(candidate.element)) {
          continue
        }
        cloned.add(candidate.element)
        play(cloneOf(candidate.element, candidate.parent))
      }
    },
    stop() {
      for (const clone of [...leaving.keys()]) {
        drop(clone)
      }
    },
  }
}
