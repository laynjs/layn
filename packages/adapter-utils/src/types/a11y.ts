export type ItemAria = {
  readonly role: 'listitem'
  readonly 'aria-setsize': number
  readonly 'aria-posinset': number
}

export type ContentAria = {
  readonly role: 'list'
}

export type ContainerAria = {
  readonly role?: 'region'
  readonly 'aria-label'?: string
}

export type ContainerAttrs = {
  readonly tabindex: number
  readonly role?: 'region'
  readonly 'aria-label'?: string
}
