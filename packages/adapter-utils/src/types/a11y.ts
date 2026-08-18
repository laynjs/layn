/** Per-item ARIA. `aria-setsize` carries the FULL count, so a screen reader announces "item 12 of
 * 40,000" even though only a screenful is in the DOM. */
export type ItemAria = {
  readonly role: 'listitem'
  readonly 'aria-setsize': number
  readonly 'aria-posinset': number
}

/** Goes on the content wrapper, the direct parent of the items, so the list ownership is valid. */
export type ContentAria = {
  readonly role: 'list'
}

/** Goes on the scroll container. Only produced when a `label` option is given. */
export type ContainerAria = {
  readonly role?: 'region'
  readonly 'aria-label'?: string
}

export type ContainerAttrs = {
  readonly tabindex: number
  readonly role?: 'region'
  readonly 'aria-label'?: string
}
