import type { ItemId } from '@laynjs/core'

export interface DragOptions {
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
