import type { ContainerAria, ContainerAttrs, ContentAria, ItemAria } from '../types/index.js'
import { CONTAINER_ROLE, CONTAINER_TAB_INDEX, CONTENT_ROLE, ITEM_ROLE } from './constants.js'

export const itemAria = (index: number, total: number): ItemAria => ({
  role: ITEM_ROLE,
  'aria-setsize': total,
  'aria-posinset': index + 1,
})

export const contentAria = (): ContentAria => ({
  role: CONTENT_ROLE,
})

export const containerAria = (label: string | undefined): ContainerAria =>
  label === undefined ? {} : { role: CONTAINER_ROLE, 'aria-label': label }

export const containerAttrs = (label: string | undefined): ContainerAttrs => ({
  tabindex: CONTAINER_TAB_INDEX,
  ...containerAria(label),
})
