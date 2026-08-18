import type { ItemId } from '@laynjs/core'

/**
 * Drag to reorder. layn reports the move; you own the data and apply it.
 *
 * Draggable items need `touch-action: none` in your CSS, or touch scrolling steals the gesture.
 * The held tile carries `data-layn-dragging` for styling.
 */
export interface DragOptions {
  /**
   * Fires *during* the drag, every time the held item crosses another, so the grid previews the
   * result. Apply the move to your array and pass it back as `items`.
   */
  readonly onReorder?: (from: number, to: number) => void
  readonly onDragStart?: (id: ItemId) => void
  readonly onDragEnd?: (id: ItemId) => void
}

export interface DragController {
  start(id: ItemId, event: PointerEvent): void
  activeId(): ItemId | undefined
  sync(): void
  stop(): void
}
