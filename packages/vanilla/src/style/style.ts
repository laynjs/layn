import type { Rect, Size } from '@laynjs/core'

export const rectStyleString = (rect: Rect): string =>
  `position:absolute;top:0;left:0;width:${rect.width}px;height:${rect.height}px;transform:translate(${rect.x}px, ${rect.y}px)`

export const contentStyleString = (size: Size): string =>
  `position:relative;width:${size.width}px;height:${size.height}px`

export const attrsString = (attrs: Record<string, string | number | undefined>): string =>
  Object.entries(attrs)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => `${name}="${value}"`)
    .join(' ')
