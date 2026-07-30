import { useRef } from 'react'

export const useConstant = <T>(create: () => T): T => {
  const ref = useRef<{ value: T } | undefined>(undefined)
  if (ref.current === undefined) {
    ref.current = { value: create() }
  }
  return ref.current.value
}
