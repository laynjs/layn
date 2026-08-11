import type { EngineConfig } from '@laynjs/core'
import type { EngineInput } from '../types/index.js'

export const resolveEngineConfig = <TData>(input: EngineInput<TData>): EngineConfig => ({
  algorithm: input.algorithm,
  items: input.items,
  ...(input.gap !== undefined ? { gap: input.gap } : {}),
  ...(input.viewport !== undefined ? { viewport: input.viewport } : {}),
  ...(input.measurements !== undefined ? { measurements: input.measurements } : {}),
  ...(input.direction !== undefined ? { direction: input.direction } : {}),
})
