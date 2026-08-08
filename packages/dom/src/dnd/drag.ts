import type { ItemId } from '@laynjs/core'
import { DRAG_Z_INDEX, DRAGGING_ATTR } from '../constants.js'
import { rafThrottle } from '../scroll/index.js'
import type { DragController } from '../types/index.js'
import { indexAtPoint } from './hit-test.js'
import type { ActiveDrag, DragSetup } from './types.js'

export const createDragController = (setup: DragSetup): DragController | undefined => {
  const reorder = setup.options.onReorder
  if (reorder === undefined) {
    return undefined
  }

  let active: ActiveDrag | undefined

  const offsetOf = (drag: ActiveDrag): { x: number; y: number } => {
    const rect = setup.engine.getSnapshot().positions.rectOf(drag.id)
    const restX = rect === undefined ? drag.startX : rect.x
    const restY = rect === undefined ? drag.startY : rect.y
    return {
      x: drag.clientX - drag.startClientX + (drag.startX - restX),
      y: drag.clientY - drag.startClientY + (drag.startY - restY),
    }
  }

  const sync = (): void => {
    if (active === undefined) {
      return
    }
    const offset = offsetOf(active)
    active.element.style.translate = `${offset.x}px ${offset.y}px`
  }

  const process = (): void => {
    const drag = active
    if (drag === undefined) {
      return
    }
    const box = drag.parent.getBoundingClientRect()
    sync()
    const positions = setup.engine.getSnapshot().positions
    const target = indexAtPoint(
      positions,
      setup.visibleOf(),
      drag.clientX - box.left,
      drag.clientY - box.top,
    )
    const current = positions.indexOf(drag.id)
    if (target === undefined || current < 0 || target === current || target === drag.requested) {
      return
    }
    drag.requested = target
    reorder(current, target)
  }

  const frame = rafThrottle(setup.environment, process)

  const onMove = (event: PointerEvent): void => {
    if (active === undefined || event.pointerId !== active.pointerId) {
      return
    }
    active.clientX = event.clientX
    active.clientY = event.clientY
    frame.run()
  }

  const settle = (drag: ActiveDrag): void => {
    const config = setup.settle
    const offset = offsetOf(drag)
    drag.element.style.translate = ''
    if (config === undefined || (offset.x === 0 && offset.y === 0)) {
      return
    }
    drag.element.animate([{ translate: `${offset.x}px ${offset.y}px` }, { translate: '0px 0px' }], {
      duration: config.duration,
      easing: config.easing,
    })
  }

  const finish = (cancelled: boolean): void => {
    const drag = active
    if (drag === undefined) {
      return
    }
    active = undefined
    frame.cancel()
    drag.element.removeEventListener('pointermove', onMove)
    drag.element.removeEventListener('pointerup', onUp)
    drag.element.removeEventListener('pointercancel', onCancel)
    drag.element.removeEventListener('dragstart', onNativeDragStart)
    drag.element.ownerDocument.removeEventListener('keydown', onKeyDown)
    drag.element.releasePointerCapture?.(drag.pointerId)
    drag.element.removeAttribute(DRAGGING_ATTR)
    drag.element.style.zIndex = ''
    if (cancelled) {
      const current = setup.engine.getSnapshot().positions.indexOf(drag.id)
      if (current >= 0 && current !== drag.originIndex) {
        reorder(current, drag.originIndex)
      }
      drag.element.style.translate = ''
    } else {
      settle(drag)
    }
    setup.options.onDragEnd?.(drag.id)
  }

  function onUp(): void {
    finish(false)
  }

  function onCancel(): void {
    finish(true)
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      finish(true)
    }
  }

  function onNativeDragStart(event: Event): void {
    event.preventDefault()
  }

  return {
    start(id: ItemId, event: PointerEvent) {
      finish(true)
      const element = setup.elementOf(id) as HTMLElement | undefined
      const parent = element?.parentElement
      if (element === undefined || parent === null || parent === undefined) {
        return
      }
      const positions = setup.engine.getSnapshot().positions
      const rect = positions.rectOf(id)
      const originIndex = positions.indexOf(id)
      if (rect === undefined || originIndex < 0) {
        return
      }
      active = {
        id,
        element,
        parent,
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: rect.x,
        startY: rect.y,
        originIndex,
        clientX: event.clientX,
        clientY: event.clientY,
        requested: undefined,
      }
      element.setPointerCapture?.(event.pointerId)
      element.setAttribute(DRAGGING_ATTR, '')
      element.style.zIndex = String(DRAG_Z_INDEX)
      element.addEventListener('pointermove', onMove)
      element.addEventListener('pointerup', onUp)
      element.addEventListener('pointercancel', onCancel)
      element.addEventListener('dragstart', onNativeDragStart)
      element.ownerDocument.addEventListener('keydown', onKeyDown)
      setup.options.onDragStart?.(id)
    },
    activeId: () => active?.id,
    sync,
    stop: () => finish(true),
  }
}
