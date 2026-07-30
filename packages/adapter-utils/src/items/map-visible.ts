import type { EngineSnapshot, LayoutItem, Rect } from '@laynjs/core'

export const mapVisible = <TData, TItem>(
  items: readonly LayoutItem<TData>[],
  snapshot: EngineSnapshot,
  visible: readonly number[],
  make: (item: LayoutItem<TData>, index: number, rect: Rect) => TItem,
): TItem[] => {
  const built: TItem[] = []
  for (const index of visible) {
    const item = items[index]
    if (item === undefined) {
      continue
    }
    built.push(make(item, index, snapshot.positions.rectAt(index)))
  }
  return built
}
