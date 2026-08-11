import type { LayoutItem } from '@laynjs/core'
import type { AnimateOption, DragOptions } from '@laynjs/dom'
import { useEffect, useMemo, useRef } from 'react'
import type { UseLaynOptions } from '../types/index.js'
import type { StableBindOptions } from './types.js'

export const useBindOptions = <TData>(options: UseLaynOptions<TData>): StableBindOptions => {
  const latest = useRef(options)
  useEffect(() => {
    latest.current = options
  })

  const animateEnabled = options.animate !== undefined && options.animate !== false
  const animateDuration = typeof options.animate === 'object' ? options.animate.duration : undefined
  const animateEasing = typeof options.animate === 'object' ? options.animate.easing : undefined
  const animate = useMemo<AnimateOption | undefined>(
    () =>
      animateEnabled
        ? {
            ...(animateDuration !== undefined ? { duration: animateDuration } : {}),
            ...(animateEasing !== undefined ? { easing: animateEasing } : {}),
          }
        : undefined,
    [animateEnabled, animateDuration, animateEasing],
  )

  const wantsReachEnd = options.onReachEnd !== undefined
  const onReachEnd = useMemo(
    () =>
      wantsReachEnd
        ? () => {
            latest.current.onReachEnd?.()
          }
        : undefined,
    [wantsReachEnd],
  )

  const wantsDrag = options.onReorder !== undefined
  const drag = useMemo<DragOptions | undefined>(
    () =>
      wantsDrag
        ? {
            onReorder: (from, to) => latest.current.onReorder?.(from, to),
            onDragStart: (id) => latest.current.onDragStart?.(id),
            onDragEnd: (id) => latest.current.onDragEnd?.(id),
          }
        : undefined,
    [wantsDrag],
  )

  const wantsSticky = options.stickyHeaders !== undefined
  const stickyHeaders = useMemo(
    () =>
      wantsSticky ? (item: LayoutItem) => latest.current.stickyHeaders?.(item) === true : undefined,
    [wantsSticky],
  )

  return {
    animate,
    onReachEnd,
    reachEndThreshold: options.reachEndThreshold,
    drag,
    stickyHeaders,
  }
}
