import type { ItemId, LayoutEngine } from '@laynjs/core'
import type { DomEnvironment, DragOptions, TransitionConfig } from '../types/index.js'

export interface DragSetup {
  readonly engine: LayoutEngine
  readonly environment: DomEnvironment
  readonly elementOf: (id: ItemId) => Element | undefined
  readonly visibleOf: () => readonly number[]
  readonly settle: TransitionConfig | undefined
  readonly options: DragOptions
}

export interface ActiveDrag {
  readonly id: ItemId
  readonly element: HTMLElement
  readonly parent: Element
  readonly pointerId: number
  readonly startClientX: number
  readonly startClientY: number
  readonly startX: number
  readonly startY: number
  readonly originIndex: number
  clientX: number
  clientY: number
  requested: number | undefined
}
