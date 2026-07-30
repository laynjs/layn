import type { LaynErrorCode } from '../types/index.js'

export class LaynError extends Error {
  readonly code: LaynErrorCode

  constructor(code: LaynErrorCode, message: string) {
    super(message)
    this.name = 'LaynError'
    this.code = code
  }
}
