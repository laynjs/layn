import { type EngineStore, resolveBindTargets } from '@laynjs/adapter-utils'
import type { LayoutEngine } from '@laynjs/core'
import { type BindOptions, bindEngine, type EngineBinding } from '@laynjs/dom'
import { type MutableRefObject, useCallback } from 'react'
import type { ContainerRefSetup } from './types.js'

export const useContainerRef = (
  engine: LayoutEngine,
  store: EngineStore,
  bindingRef: MutableRefObject<EngineBinding | undefined>,
  setup: ContainerRefSetup,
): ((element: HTMLElement | null) => void) => {
  const { axis, overscan, scroll, animate, onReachEnd, reachEndThreshold, stickyHeaders } = setup
  const { drag, environment } = setup

  return useCallback(
    (element: HTMLElement | null): void => {
      if (element === null) {
        store.detach()
        bindingRef.current?.destroy()
        bindingRef.current = undefined
        return
      }
      const targets = resolveBindTargets(scroll, element)
      const bindOptions: BindOptions = {
        scroll: targets.scroll,
        axis,
        overscan,
        ...(targets.origin !== undefined ? { origin: targets.origin } : {}),
        ...(animate !== undefined ? { animate } : {}),
        ...(onReachEnd !== undefined ? { onReachEnd } : {}),
        ...(reachEndThreshold !== undefined ? { reachEndThreshold } : {}),
        ...(stickyHeaders !== undefined ? { stickyHeaders } : {}),
        ...(drag !== undefined ? { drag } : {}),
        ...(environment !== undefined ? { environment } : {}),
      }
      const binding = bindEngine(engine, bindOptions)
      bindingRef.current = binding
      store.attach(binding)
    },
    [
      engine,
      store,
      bindingRef,
      axis,
      overscan,
      animate,
      onReachEnd,
      reachEndThreshold,
      stickyHeaders,
      drag,
      environment,
      scroll,
    ],
  )
}
