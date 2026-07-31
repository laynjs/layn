import type { Rect, Size } from '@laynjs/core'
import type { ScrollMode } from '../types/index.js'

export const applyRectStyle = (element: HTMLElement, rect: Rect): void => {
  element.style.position = 'absolute'
  element.style.top = '0'
  element.style.left = '0'
  element.style.width = `${rect.width}px`
  element.style.height = `${rect.height}px`
  element.style.transform = `translate(${rect.x}px, ${rect.y}px)`
}

export const applyContentStyle = (element: HTMLElement, size: Size): void => {
  element.style.position = 'relative'
  element.style.width = `${size.width}px`
  element.style.height = `${size.height}px`
}

export const applyAttrs = (
  element: HTMLElement,
  attrs: Record<string, string | number | undefined>,
): void => {
  for (const [name, value] of Object.entries(attrs)) {
    if (value !== undefined) {
      element.setAttribute(name, String(value))
    }
  }
}

export const rectStyleObject = (rect: Rect): Record<string, string> => ({
  position: 'absolute',
  top: '0',
  left: '0',
  width: `${rect.width}px`,
  height: `${rect.height}px`,
  transform: `translate(${rect.x}px, ${rect.y}px)`,
})

export const contentStyleObject = (size: Size): Record<string, string> => ({
  position: 'relative',
  width: `${size.width}px`,
  height: `${size.height}px`,
})

export const containerStyleObject = (mode: ScrollMode | undefined): Record<string, string> =>
  mode === 'window' ? { position: 'relative' } : { position: 'relative', overflow: 'auto' }
