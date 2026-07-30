export type ItemId = string | number

export interface Size {
  readonly width: number
  readonly height: number
}

export interface Rect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface Gap {
  readonly x: number
  readonly y: number
}

export interface Viewport {
  readonly width: number
  readonly height: number
}
