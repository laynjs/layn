import { resolveBindTargets } from '@laynjs/adapter-utils'
import type { ScrollAxis } from '@laynjs/core'
import type { BindOptions, DragOptions } from '@laynjs/dom'
import type { LaynOptions } from '../types/index.js'

const dragOf = <TData>(options: LaynOptions<TData>): DragOptions | undefined => {
  if (options.onReorder === undefined) {
    return undefined
  }
  return {
    onReorder: options.onReorder,
    ...(options.onDragStart !== undefined ? { onDragStart: options.onDragStart } : {}),
    ...(options.onDragEnd !== undefined ? { onDragEnd: options.onDragEnd } : {}),
  }
}

export const bindOptionsFor = <TData>(
  container: HTMLElement,
  options: LaynOptions<TData>,
  axis: ScrollAxis,
  overscan: number,
): BindOptions => {
  const targets = resolveBindTargets(options.scroll, container)
  const drag = dragOf(options)
  return {
    scroll: targets.scroll,
    axis,
    overscan,
    ...(targets.origin !== undefined ? { origin: targets.origin } : {}),
    ...(options.animate !== undefined ? { animate: options.animate } : {}),
    ...(options.onReachEnd !== undefined ? { onReachEnd: options.onReachEnd } : {}),
    ...(options.reachEndThreshold !== undefined
      ? { reachEndThreshold: options.reachEndThreshold }
      : {}),
    ...(drag !== undefined ? { drag } : {}),
    ...(options.environment !== undefined ? { environment: options.environment } : {}),
  }
}
