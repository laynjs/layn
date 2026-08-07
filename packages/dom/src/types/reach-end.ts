export interface ReachEndWatcher {
  check(start: number, size: number, extent: number): void
  stop(): void
}
