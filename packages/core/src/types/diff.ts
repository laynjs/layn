/**
 * How one item array differs from the previous one. Only `identical` and `append` avoid a full
 * relayout: every other change invalidates placement from the change point onwards, since each item
 * is placed relative to the ones before it.
 */
export type ItemsDiffKind = 'identical' | 'append' | 'prepend' | 'insert' | 'remove' | 'replace'

export interface ItemsDiff {
  readonly kind: ItemsDiffKind
  readonly commonPrefix: number
  readonly commonSuffix: number
  readonly addedCount: number
  readonly removedCount: number
}
