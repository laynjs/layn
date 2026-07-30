export type ItemsDiffKind = 'identical' | 'append' | 'replace'

export interface ItemsDiff {
  readonly kind: ItemsDiffKind
  readonly commonPrefix: number
}
