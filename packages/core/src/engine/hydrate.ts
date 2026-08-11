import { SERIALIZATION_VERSION } from '../constants.js'
import { LaynError } from '../errors/index.js'
import type {
  EngineSnapshot,
  HydrateOptions,
  LayoutEngine,
  SerializedLayout,
} from '../types/index.js'
import { createEngine } from './engine.js'

const verifyHydration = (serialized: SerializedLayout, snapshot: EngineSnapshot): void => {
  const expected = serialized.positions
  const positions = snapshot.positions
  if (expected.ids.length !== positions.count) {
    throw new LaynError(
      'HYDRATION_MISMATCH',
      `layn hydration mismatch: serialized ${expected.ids.length} items, recomputed ${positions.count}`,
    )
  }
  for (let i = 0; i < positions.count; i += 1) {
    if (
      positions.idAt(i) !== expected.ids[i] ||
      positions.x[i] !== expected.x[i] ||
      positions.y[i] !== expected.y[i] ||
      positions.width[i] !== expected.width[i] ||
      positions.height[i] !== expected.height[i]
    ) {
      throw new LaynError('HYDRATION_MISMATCH', `layn hydration mismatch for item at index ${i}`)
    }
  }
}

export const hydrateEngine = (
  serialized: SerializedLayout,
  options: HydrateOptions,
): LayoutEngine => {
  if (serialized.version !== SERIALIZATION_VERSION) {
    throw new LaynError(
      'SERIALIZATION_VERSION_MISMATCH',
      `layn cannot hydrate serialized layout version ${serialized.version}; this build expects version ${SERIALIZATION_VERSION}`,
    )
  }
  if (serialized.algorithm !== options.algorithm.name) {
    throw new LaynError(
      'ALGORITHM_MISMATCH',
      `layn cannot hydrate a "${serialized.algorithm}" layout with a "${options.algorithm.name}" algorithm`,
    )
  }

  const engine = createEngine({
    ...options,
    gap: serialized.gap,
    viewport: serialized.viewport,
    items: serialized.items,
    measured: serialized.measured,
    ...(serialized.direction !== undefined ? { direction: serialized.direction } : {}),
  })

  if (options.verify === true) {
    verifyHydration(serialized, engine.getSnapshot())
  }

  return engine
}
