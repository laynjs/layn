export interface MagazineRow {
  readonly weights: readonly number[]
  readonly height: number
}

export interface MagazineOptions {
  readonly rowHeight?: number
  readonly templates?: readonly MagazineRow[]
}
