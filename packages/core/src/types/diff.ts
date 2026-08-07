export type ItemsDiffKind = 'identical' | 'append' | 'prepend' | 'insert' | 'remove' | 'replace'

export interface ItemsDiff {
  readonly kind: ItemsDiffKind
  readonly commonPrefix: number
  readonly commonSuffix: number
  readonly addedCount: number
  readonly removedCount: number
}
